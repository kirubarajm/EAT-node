'user strict';

const dunzoconst = {
    created: "created",
    queued: "queued",
    runner_accepted: "runner_accepted",
    runner_cancelled: "runner_cancelled",
    reached_for_pickup: "reached_for_pickup",
    pickup_complete: "pickup_complete",
    started_for_delivery: "started_for_delivery",
    reached_for_delivery: "reached_for_delivery",
    delivered:"delivered",
    cancelled:"cancelled",
    
    order_assign_dunzo:true,
    order_assign_dunzo_waiting_min:4,
    dunzo_create_url:'https://apis-staging.dunzo.in/api/v1/tasks?test=true',
    dunzo_client_id : "c6c3acd5-e254-4404-ad06-c0c1d2aafd1e",
    Authorization : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkIjp7InJvbGUiOjEwMCwidWlkIjoiZTRiNDU5ZTktODIxOS00M2Q2LWEyYWQtZDJlODhkOTBlYmI1In0sIm1lcmNoYW50X3R5cGUiOm51bGwsImNsaWVudF9pZCI6ImM2YzNhY2Q1LWUyNTQtNDQwNC1hZDA2LWMwYzFkMmFhZmQxZSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL2dvb2dsZS5pZGVudGl0eS5pZGVudGl0eXRvb2xraXQudjEuSWRlbnRpdHlUb29sa2l0IiwibmFtZSI6IkFQSVVTRVIiLCJ1dWlkIjoiZTRiNDU5ZTktODIxOS00M2Q2LWEyYWQtZDJlODhkOTBlYmI1Iiwicm9sZSI6MTAwLCJkdW56b19rZXkiOiIwNmRkZGU1Yy1jODlkLTRiZjgtYjBhMi0wY2Q3NWE2NTVkYWQiLCJleHAiOjE3MjkzMjc1MTAsInYiOjAsImlhdCI6MTU3MzgwNzUxMCwic2VjcmV0X2tleSI6Ik5vbmUifQ.JlCgWiNAcIC82EYqY2MtpT1eoLl-0_yQ88lEkI3j0UY",
  
}

module.exports = dunzoconst;