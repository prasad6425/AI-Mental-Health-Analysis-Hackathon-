from fastapi import APIRouter, Depends, HTTPException
from backend.core.security import get_current_user
from backend.services.ai_anomaly import detect_anomalies
from backend.db.supabase import supabase
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/anomalies")
async def run_anomaly_detection(user = Depends(get_current_user)):
    try:
        # 1. Fetch recent mood logs
        logs = supabase.table("mood_logs").select("id, mood_score, stress_score").eq("user_id", user.id).limit(30).execute()
        user_data = logs.data

        # 2. Run Isolation Forest
        anomalies = detect_anomalies(user_data)

        # 3. Save alerts to DB
        saved_alerts = []
        for anomaly in anomalies:
            res = supabase.table("anomaly_alerts").insert({
                "user_id": user.id,
                "alert_reason": anomaly["alert_reason"],
                "severity": anomaly["burnout_risk"]
            }).execute()
            saved_alerts.append(res.data[0])

        return {"status": "success", "anomalies_detected": len(anomalies), "alerts": saved_alerts}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/global")
async def get_global_analytics():
    try:
        # 1. Total Users
        users_res = supabase.table("users").select("id", count="exact").execute()
        total_users = users_res.count if users_res.count else 1
        
        # 2. Total Games Played
        streaks_res = supabase.table("streaks").select("total_xp").execute()
        total_xp = sum([s.get("total_xp", 0) for s in streaks_res.data]) if streaks_res.data else 0
        total_games = total_xp // 15
        
        # 3. Wellness Scores for Recovery Rate & Mood Distribution
        scores_res = supabase.table("wellness_scores").select("*").execute()
        scores = scores_res.data
        
        recovered_count = 0
        in_progress_count = 0
        
        mood_dist = {
            "Positive": 0,
            "Moderate": 0,
            "High Stress": 0,
            "Critical": 0
        }
        
        for s in scores:
            if s.get("recovery_progress", 0) >= 80:
                recovered_count += 1
            else:
                in_progress_count += 1
                
            overall = s.get("overall_score", 0)
            if overall > 75:
                mood_dist["Positive"] += 1
            elif overall > 50:
                mood_dist["Moderate"] += 1
            elif overall > 25:
                mood_dist["High Stress"] += 1
            else:
                mood_dist["Critical"] += 1
                
        total_scores = recovered_count + in_progress_count
        recovery_rate = int((recovered_count / total_scores) * 100) if total_scores > 0 else 0
        active_treatments = in_progress_count
        
        recovery_data = [
            {"name": "Recovered", "value": recovered_count, "color": "#10b981"},
            {"name": "In Progress", "value": in_progress_count, "color": "#6366f1"}
        ]
        # Avoid empty pie chart
        if recovered_count == 0 and in_progress_count == 0:
            recovery_data = [{"name": "No Data", "value": 1, "color": "#334155"}]
        
        mood_data = [
            {"name": "Positive", "count": mood_dist["Positive"], "color": "#3b82f6"},
            {"name": "Moderate", "count": mood_dist["Moderate"], "color": "#8b5cf6"},
            {"name": "High Stress", "count": mood_dist["High Stress"], "color": "#f59e0b"},
            {"name": "Critical", "count": mood_dist["Critical"], "color": "#ef4444"},
        ]
        
        # 4. Active Users over 7 days (from mood logs)
        seven_days_ago = (datetime.utcnow() - timedelta(days=6)).isoformat()
        logs_res = supabase.table("mood_logs").select("updated_at").gte("updated_at", seven_days_ago).execute()
        
        days_count = {}
        for i in range(7):
            d = (datetime.utcnow() - timedelta(days=6-i)).strftime("%a")
            days_count[d] = 0
            
        for log in logs_res.data:
            day_str = datetime.fromisoformat(log["updated_at"].replace("Z", "+00:00")).strftime("%a")
            if day_str in days_count:
                days_count[day_str] += 1
                
        active_users_data = [{"name": k, "users": v} for k, v in days_count.items()]
        
        # 5. Live Activities
        recent_logs = supabase.table("mood_logs").select("user_id, updated_at").order("updated_at", desc=True).limit(5).execute()
        live_activities = []
        for i, log in enumerate(recent_logs.data):
            uid_short = log["user_id"][:4]
            time_diff = datetime.utcnow() - datetime.fromisoformat(log["updated_at"].replace("Z", "").split("+")[0])
            minutes = int(time_diff.total_seconds() / 60)
            time_str = f"{minutes} min ago" if minutes > 0 else "Just now"
            
            live_activities.append({
                "id": i + 1,
                "text": f"User #{uid_short} completed a mood check-in",
                "time": time_str,
                "icon": "HeartPulse",
                "color": "text-emerald-400"
            })
            
        return {
            "total_users": total_users,
            "active_treatments": active_treatments,
            "recovery_rate": f"{recovery_rate}%",
            "total_games": total_games,
            "recovery_data": recovery_data,
            "mood_data": mood_data,
            "active_users_data": active_users_data,
            "live_activities": live_activities
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
