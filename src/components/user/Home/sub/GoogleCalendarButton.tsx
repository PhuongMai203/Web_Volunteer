"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export default function GoogleCalendarButton() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      console.log("Google Identity Script loaded");
    };
    document.body.appendChild(script);
  }, []);

  const handleSync = () => {
    if (!accessToken) {
      signInWithGoogle();
    } else {
      createCalendarEvent();
    }
  };

  const signInWithGoogle = () => {
    // @ts-expect-error window.google may not exist on initial render
    window.google.accounts.id.initialize({
      client_id: "328324807771-gtsiudreeuom7vufk4n1kp53c0sg5o64.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    // @ts-expect-error window.google may not exist on initial render
    window.google.accounts.id.prompt();
  };

    const handleCredentialResponse = (response: { credential: string }) => {
    const decoded = jwtDecode<GoogleUser>(response.credential);
    console.log("Thông tin người dùng:", decoded); 
    getAccessToken();
  };


  const getAccessToken = async () => {
    // @ts-expect-error window.google may not exist on initial render
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: "328324807771-gtsiudreeuom7vufk4n1kp53c0sg5o64.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/calendar",
      callback: (resp: { access_token?: string }) => {
        if (resp.access_token) {
          setAccessToken(resp.access_token);
          createCalendarEvent();
        } else {
          alert("Không lấy được Access Token.");
        }
      },
    });
    client.requestAccessToken();
  };

  const createCalendarEvent = async () => {
    if (!accessToken) return;

    const event = {
      summary: "Sự kiện từ Help Connect",
      description: "Đồng bộ từ hệ thống của bạn.",
      start: { dateTime: new Date(Date.now() + 3600000).toISOString(), timeZone: "Asia/Ho_Chi_Minh" },
      end: { dateTime: new Date(Date.now() + 7200000).toISOString(), timeZone: "Asia/Ho_Chi_Minh" },
    };

    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (res.ok) {
      alert("Tạo sự kiện thành công!");
    } else {
      alert("Tạo sự kiện thất bại.");
    }
  };

  return (
    <div className="googleCalendarContainer">
      <button onClick={handleSync} className="syncButton">
        Đồng bộ với Lịch Google Calendar
      </button>

      <style jsx>{`
        .googleCalendarContainer {
          text-align: center;
        }
        .syncButton {
          background-color: rgb(244, 131, 66);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
        }
        .syncButton:hover {
          background-color: #f97316;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
