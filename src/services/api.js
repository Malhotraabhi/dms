const API_BASE = "https://apis.allsoft.co/api/documentManagement";


export async function sendOtp(mobile_number) {
  const res = await fetch(`${API_BASE}/generateOTP`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile_number }),
  });
  return res.json();
}

export async function verifyOtp(mobile_number, otp) {
  const res = await fetch(`${API_BASE}/validateOTP`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile_number, otp }),
  });
  return res.json();
}



export async function uploadDocument(formData, session) {
  try {
    console.log(session);
    
    if (!session?.token || !session?.user_id) {
      throw new Error("Missing token or user_id in session");
    }

    const res = await fetch(`${API_BASE}/saveDocumentEntry`, {
      method: "POST",
      headers: {
        token: session.token,    
        user_id: session.user_id 
      },
      body: formData,
    });

    return await res.json();
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    return { status: false, message: error.message };
  }
}


export async function searchDocuments(body, token) {
  try {
    const res = await fetch(`${API_BASE}/searchDocumentEntry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`❌ API failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log("📌 Search API response:", data); // ✅ debug log
    return data;
  } catch (err) {
    console.error("❌ searchDocuments error:", err);
    return { status: false, data: [] };
  }
}



export async function getDocumentTags(token, term = "") {
  const res = await fetch(`${API_BASE}/documentTags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify({ term }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch document tags");
  }

  return res.json();
}


