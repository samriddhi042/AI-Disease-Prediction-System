import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  ArrowRight,
  Download,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
 Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import jsPDF from "jspdf";

import toast, { Toaster } from "react-hot-toast";

import "./App.css";

function App() {

  const [currentPage, setCurrentPage] = useState("login");

  const [loading, setLoading] = useState(false);

  const [historyData, setHistoryData] = useState([]);

  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loggedInUser, setLoggedInUser] = useState("");

  const [loggedInEmail, setLoggedInEmail] = useState("");

  useEffect(() => {

  const savedUser =
    localStorage.getItem("username");

  const savedEmail =
    localStorage.getItem("email");

  const isLoggedIn =
    localStorage.getItem("isLoggedIn");

  if (savedUser && isLoggedIn) {

    setLoggedInUser(savedUser);

    setLoggedInEmail(savedEmail);

    setCurrentPage("home");
  }

}, []);


useEffect(() => {

  const protectedPages = [
    "home",
    "patient",
    "symptoms",
    "result",
    "history"
  ];

  const isLoggedIn =
    localStorage.getItem("isLoggedIn");

  if (
    protectedPages.includes(currentPage) &&
    !isLoggedIn
  ) {

    setCurrentPage("login");
  }

}, [currentPage]);

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const [prediction, setPrediction] = useState("");

  const [predictionConfidence, setPredictionConfidence] = useState(0);

  const [topPredictions, setTopPredictions] = useState([]);

  const [prevention, setPrevention] = useState([]);

  const [age, setAge] = useState("");

  const [gender, setGender] = useState("Male");

  const [temperature, setTemperature] = useState("");

  const symptoms = [

    { label: "Fever", value: "fever" },
    { label: "Headache", value: "headache" },
    { label: "Joint Pain", value: "joint_pain" },
    { label: "Muscle Pain", value: "muscle_pain" },
    { label: "Fatigue", value: "fatigue" },
    { label: "Nausea", value: "nausea" },
    { label: "Vomiting", value: "vomiting" },
    { label: "Rash", value: "rash" },
    { label: "Chills", value: "chills" },
    { label: "Sweating", value: "sweating" },
    { label: "Dehydration", value: "dehydration" },
    { label: "Dizziness", value: "dizziness" },
    { label: "Weakness", value: "weakness" },
    { label: "Cough", value: "cough" },
    { label: "Sore Throat", value: "sore_throat" },
    { label: "Runny Nose", value: "runny_nose" },
    { label: "Sneezing", value: "sneezing" },
    { label: "Confusion", value: "confusion" },
    { label: "Rapid Heartbeat", value: "rapid_heartbeat" },
    { label: "Dry Skin", value: "dry_skin" },
    { label: "Eye Pain", value: "eye_pain" },
    { label: "Travel History", value: "travel_history" },

  ];

  const handleSymptomChange = (symptom) => {

    if (selectedSymptoms.includes(symptom)) {

      setSelectedSymptoms(
        selectedSymptoms.filter((s) => s !== symptom)
      );

    } else {

      setSelectedSymptoms([
        ...selectedSymptoms,
        symptom,
      ]);
    }
  };

  const handlePrediction = async () => {

    if (
      !age ||
      !temperature ||
      selectedSymptoms.length === 0
    ) {

      toast.error("Please fill all details");

      return;
    }

    setLoading(true);

    setCurrentPage("loading");

    try {

      const symptomPayload = {

        age: Number(age),

        gender: gender === "Male" ? 1 : 0,

        temperature_f: Number(temperature),

        user_email: loggedInEmail,

      };

      symptoms.forEach((symptom) => {

        symptomPayload[symptom.value] =
          selectedSymptoms.includes(symptom.value)
            ? 1
            : 0;

      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/predict`,
        symptomPayload
      );

      setPrediction(
        response.data.predicted_disease
      );

      setTopPredictions(
        response.data.top_predictions
      );

      setPredictionConfidence(
        response.data.top_predictions[0].confidence
      );

      setPrevention(
        response.data.prevention
      );

      setTimeout(() => {

        setCurrentPage("result");

        setLoading(false);

      }, 1500);

    } catch (error) {

      console.log(error);

      toast.error("Prediction Failed");

      setLoading(false);

      setCurrentPage("symptoms");
    }
  };

  const handleSignup = async () => {

  if (!username || !email || !password) {

    toast.error("Please fill all fields");

    return;
  }

  try {

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/signup`,
      {
        username,
        email,
        password
      }
    );

    toast.success(response.data.message);

    if (
      response.data.message ===
      "Signup successful"
    ) {

      setCurrentPage("login");

    }

  } catch (error) {

    console.log(error);

    toast.error(
      error.response?.data?.detail ||
      "Server waking up... Please wait 30 seconds and try again"
    );
  }
};

const handleLogin = async () => {

  if (!email || !password) {

    toast.error("Please fill all fields");

    return;
  }

  try {

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/login`,
      {
        email,
        password
      }
    );

    if (
      response.data.message ===
      "Login successful"
    ) {

      setLoggedInUser(
  response.data.username
);

setLoggedInEmail(
  response.data.email
);

localStorage.setItem(
  "username",
  response.data.username
);

localStorage.setItem(
  "email",
  response.data.email
);

localStorage.setItem(
  "isLoggedIn",
  "true"
);


setCurrentPage("home");
    } else {

      toast.error(response.data.message);
    }

  } catch (error) {

    console.log(error);

    toast.error(
      error.response?.data?.detail ||
      "Server waking up... Please wait 30 seconds and try again"
    );
  }
};

const handleLogout = () => {

  localStorage.removeItem("username");

  localStorage.removeItem("email");

  localStorage.removeItem("isLoggedIn");

  setLoggedInUser("");

  setLoggedInEmail("");

  setCurrentPage("login");
};


  const fetchHistory = async () => {

  try {

  const response = await axios.get(
  `${process.env.REACT_APP_API_URL}/history/${loggedInEmail}`
  );

    setHistoryData(response.data);

    setCurrentPage("history");

  } catch (error) {

    console.log(error);

    toast.error("Failed to load history");

  }
};

  const resetForm = () => {

    setSelectedSymptoms([]);

    setPrediction("");

    setPredictionConfidence(0);

    setTopPredictions([]);

    setPrevention([]);

    setAge("");

    setGender("Male");

    setTemperature("");

    setCurrentPage("home");
  };

  const downloadPDF = () => {

  const doc = new jsPDF();

  const currentDate = new Date().toLocaleString();

  /* HEADER */
  doc.setFillColor(100, 120, 255);

  doc.rect(0, 0, 220, 35, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFontSize(24);

  doc.text(
    "AI Healthcare Report",
    20,
    22
  );

  doc.setFontSize(11);

  doc.text(
    "AI Disease Prediction & Prevention System",
    20,
    30
  );

  /* RESET COLOR */
  doc.setTextColor(20, 36, 92);

  /* TIMESTAMP */
  doc.setFontSize(10);

  doc.text(
    `Generated: ${currentDate}`,
    140,
    30
  );

  /* PATIENT INFO */
  doc.setFontSize(18);

  doc.text(
    "Patient Information",
    20,
    50
  );

  doc.setDrawColor(220);

  doc.line(20, 54, 190, 54);

  doc.setFontSize(12);

  doc.text(
    `Age: ${age}`,
    20,
    68
  );

  doc.text(
    `Gender: ${gender}`,
    70,
    68
  );

  doc.text(
    `Temperature: ${temperature} °F`,
    130,
    68
  );

  /* SYMPTOMS */
  doc.setFontSize(18);

  doc.text(
    "Selected Symptoms",
    20,
    90
  );

  doc.line(20, 94, 190, 94);

  doc.setFontSize(12);

  let symptomY = 108;

  selectedSymptoms.forEach((symptom, index) => {

    doc.circle(24, symptomY - 1.5, 1.2, "F");

    doc.text(
      symptom.replaceAll("_", " "),
      30,
      symptomY
    );

    symptomY += 10;

  });

  /* PREDICTION SECTION */
  const predictionBoxY = symptomY + 15;

  doc.setFillColor(245, 247, 255);

  doc.roundedRect(
    20,
    predictionBoxY,
    170,
    40,
    5,
    5,
    "F"
  );

  doc.setFontSize(18);

  doc.setTextColor(20, 36, 92);

  doc.text(
    "AI Prediction Result",
    30,
    predictionBoxY + 12
  );

  doc.setFontSize(22);

  doc.setTextColor(100, 120, 255);

  doc.text(
    prediction.toUpperCase(),
    30,
    predictionBoxY + 28
  );

  doc.setFontSize(12);

  doc.setTextColor(80);

  doc.text(
    `Confidence Score: ${predictionConfidence}%`,
    120,
    predictionBoxY + 28
  );

  /* RISK LEVEL */
  const riskY = predictionBoxY + 60;

  doc.setFontSize(18);

  doc.setTextColor(20, 36, 92);

  doc.text(
    "Risk Evaluation",
    20,
    riskY
  );

  doc.line(20, riskY + 4, 190, riskY + 4);

  let riskLevel = "Low";

  if (predictionConfidence >= 70) {

    riskLevel = "High";

  } else if (predictionConfidence >= 40) {

    riskLevel = "Medium";
  }

  doc.setFontSize(14);

  doc.text(
    `Risk Level: ${riskLevel}`,
    20,
    riskY + 18
  );

  /* PREVENTION */
  const preventionY = riskY + 40;

  doc.setFontSize(18);

  doc.text(
    "Prevention Guidance",
    20,
    preventionY
  );

  doc.line(
    20,
    preventionY + 4,
    190,
    preventionY + 4
  );

  doc.setFontSize(12);

  let preventionStartY = preventionY + 18;

  prevention.forEach((tip) => {

    doc.circle(
      24,
      preventionStartY - 1.5,
      1.2,
      "F"
    );

    doc.text(
      tip,
      30,
      preventionStartY
    );

    preventionStartY += 10;

  });

  /* DISCLAIMER */
  const disclaimerY = preventionStartY + 20;

  doc.setFillColor(250, 250, 250);

  doc.roundedRect(
    20,
    disclaimerY,
    170,
    30,
    5,
    5,
    "F"
  );

  doc.setFontSize(10);

  doc.setTextColor(100);

  doc.text(
    "Disclaimer: This AI-generated healthcare analysis is intended for educational and informational purposes only. Please consult a certified medical professional for accurate diagnosis and treatment.",
    25,
    disclaimerY + 12,
    {
      maxWidth: 155
    }
  );

  /* FOOTER */
  doc.setFontSize(10);

  doc.setTextColor(120);

  doc.text(
    "AI Healthcare Disease Prediction System",
    20,
    285
  );

  doc.text(
    "Generated using Machine Learning & FastAPI",
    120,
    285
  );

  /* SAVE */
  doc.save(
    "AI_Healthcare_Report.pdf"
  );
};

  return (

    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />

      {loading && (

  <div className="fixed inset-0 bg-[#07152F]/95 backdrop-blur-xl z-[100] flex items-center justify-center px-6">

    <div className="max-w-lg w-full text-center">

      {/* AI ICON */}
      <div className="relative flex justify-center">

        <div className="absolute w-44 h-44 rounded-full bg-cyan-400/20 animate-ping"></div>

        <div className="w-44 h-44 rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-7xl shadow-[0_0_80px_rgba(37,99,235,0.5)]">

          🧠

        </div>

      </div>

      {/* TITLE */}
      <h1 className="mt-12 text-4xl sm:text-5xl font-bold text-white leading-tight">

        AI Medical Analysis Running

      </h1>

      {/* SUBTITLE */}
      <p className="mt-5 text-gray-300 text-lg leading-relaxed">

        Our AI engine is analyzing patient symptoms,
        evaluating disease probabilities,
        and generating healthcare insights.

      </p>

      {/* LOADING BAR */}
      <div className="mt-10 h-3 w-full bg-white/10 rounded-full overflow-hidden">

        <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] animate-pulse"></div>

      </div>

      {/* STATUS */}
      <div className="mt-6 flex justify-center gap-2 text-cyan-300 text-sm tracking-wider">

        <span className="animate-bounce">●</span>
        <span className="animate-bounce delay-100">●</span>
        <span className="animate-bounce delay-200">●</span>

      </div>

      <p className="mt-4 text-gray-400 text-sm">

        Processing healthcare intelligence

      </p>

    </div>

  </div>
)}

    <div className="min-h-screen bg-[#EEF2F7]">

  {/* TOP NAVBAR */}
  {loggedInUser && (

    <div className="w-full bg-[#07152F] border-b border-white/10 sticky top-0 z-50 shadow-lg">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white text-xl shadow-lg">

            🩺

          </div>

          <div>

            <h1 className="text-white font-bold text-lg">
              AI Disease Prediction
            </h1>

            <p className="text-gray-400 text-xs">
              Smart Healthcare Platform
            </p>

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* HISTORY BUTTON */}
          <button
            onClick={() => {

              const isLoggedIn =
                localStorage.getItem("isLoggedIn");

              if (!isLoggedIn) {

                setCurrentPage("login");

                return;
              }

              fetchHistory();

              setCurrentPage("history");
            }}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
          >
            History
          </button>

          {/* USERNAME */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10">

            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white font-bold">

              {loggedInUser.charAt(0)}

            </div>

            <div>

              <p className="text-xs text-gray-400">
                Welcome
              </p>

              <h3 className="text-white font-semibold">
                {loggedInUser}
              </h3>

            </div>

          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-300 shadow-lg"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  )}
    
    {/* LOGIN PAGE */}
{currentPage === "login" && (

  <div className="min-h-screen animate-fadeIn bg-gradient-to-br from-[#020817] via-[#07152F] to-[#0A1F44] flex items-center justify-center px-4">

    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.4)]">

      {/* LEFT SIDE */}
      <div className="p-10 lg:p-16 flex flex-col justify-center relative overflow-hidden">

        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#2563EB]/20 rounded-full blur-[100px]"></div>

        <div className="relative z-10">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/10 mb-8">

            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>

            <p className="text-sm text-gray-300">
              AI Healthcare Platform
            </p>

          </div>

          <h1 className="text-5xl font-bold text-white leading-tight">

            Welcome Back

          </h1>

          <p className="mt-6 text-gray-400 leading-relaxed text-lg max-w-lg">

            Access your personalized AI healthcare assistant, disease predictions, medical reports, and healthcare history securely.

          </p>

          <div className="mt-12 space-y-5">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/20 flex items-center justify-center text-2xl">
                🩺
              </div>

              <div>

                <h3 className="text-white font-semibold">
                  AI Disease Prediction
                </h3>

                <p className="text-gray-400 text-sm">
                  Smart ML-powered healthcare analysis
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/20 flex items-center justify-center text-2xl">
                📄
              </div>

              <div>

                <h3 className="text-white font-semibold">
                  Medical Reports
                </h3>

                <p className="text-gray-400 text-sm">
                  Download professional healthcare PDFs
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/20 flex items-center justify-center text-2xl">
                🔒
              </div>

              <div>

                <h3 className="text-white font-semibold">
                  Secure Records
                </h3>

                <p className="text-gray-400 text-sm">
                  Access your personal healthcare history
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="bg-white p-10 lg:p-16 flex flex-col justify-center">

        <div className="max-w-md w-full mx-auto">

          <h2 className="text-4xl font-bold text-[#14245C]">
            Login
          </h2>

          <p className="text-gray-500 mt-3">
            Continue to your healthcare dashboard
          </p>

          {/* EMAIL */}
          <div className="mt-10">

            <label className="text-sm font-medium text-gray-600">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full mt-3 px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#2563EB]"
            />

          </div>

          {/* PASSWORD */}
          <div className="mt-6">

            <label className="text-sm font-medium text-gray-600">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full mt-3 px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#2563EB]"
            />

          </div>

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            className="w-full mt-10 py-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl"
          >

            Login to Dashboard

          </button>

          {/* SIGNUP LINK */}
          <p className="text-center text-gray-500 mt-8">

            Don’t have an account?

            <span
              onClick={() =>
                setCurrentPage("signup")
              }
              className="text-[#2563EB] font-semibold cursor-pointer ml-2"
            >
              Create Account
            </span>

          </p>

        </div>

      </div>

    </div>

  </div>
)}

{/* SIGNUP PAGE */}
{currentPage === "signup" && (

  <div className="min-h-screen animate-fadeIn bg-gradient-to-br from-[#020817] via-[#07152F] to-[#0A1F44] flex items-center justify-center px-4">

    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.4)]">

      {/* LEFT SIDE */}
      <div className="p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">

        <div className="absolute top-0 left-0 w-[220px] h-[220px] bg-[#2563EB]/20 rounded-full blur-[100px]"></div>

        <div className="relative z-10">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/10 mb-8">

            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>

            <p className="text-sm text-gray-300">
              AI Healthcare Platform
            </p>

          </div>

          <h1 className="text-4xl font-bold text-white leading-tight">
            Create Account
          </h1>

          <p className="mt-6 text-gray-400 leading-relaxed text-lg max-w-lg">
            Create your secure healthcare account to access AI-powered disease prediction and patient history.
          </p>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">

        <div className="max-w-md w-full mx-auto">

          <h2 className="text-4xl font-bold text-[#14245C]">
            Sign Up
          </h2>

          <p className="text-gray-500 mt-3">
            Create your healthcare dashboard account
          </p>

          {/* USERNAME */}
          <div className="mt-8">

            <label className="text-sm font-medium text-gray-600">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="w-full mt-3 px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#2563EB]"
            />

          </div>

          {/* EMAIL */}
          <div className="mt-6">

            <label className="text-sm font-medium text-gray-600">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full mt-3 px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#2563EB]"
            />

          </div>

          {/* PASSWORD */}
          <div className="mt-6">

            <label className="text-sm font-medium text-gray-600">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full mt-3 px-5 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#2563EB]"
            />

          </div>

          {/* BUTTON */}
          <button
            onClick={handleSignup}
            className="w-full mt-10 py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl"
          >

            Create Account

          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-gray-500 mt-8">

            Already have an account?

            <span
              onClick={() =>
                setCurrentPage("login")
              }
              className="text-[#2563EB] font-semibold cursor-pointer ml-2"
            >
              Login
            </span>

          </p>

        </div>

      </div>

    </div>

  </div>
)}

      {/* HOME PAGE */}
{currentPage === "home" && (

  <div className="min-h-screen animate-fadeIn bg-gradient-to-br from-[#F4F7FF] via-[#EEF4FF] to-[#E6F7FF] overflow-hidden">
  
  <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#6478FF]/10 rounded-full blur-[120px]"></div>

  <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#5EEAD4]/10 rounded-full blur-[120px]"></div>
    
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* TOP NAV */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] flex items-center justify-center text-white text-xl shadow-lg">
            +
          </div>

          <div>

            <h2 className="text-xl font-bold text-[#14245C]">
              AI HealthCare
            </h2>

            <p className="text-sm text-gray-500">
              Disease Prediction System
            </p>

          </div>

        </div>

        <div className="hidden md:flex items-center gap-4">

          <div className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-md text-sm text-gray-600">
            AI Powered
          </div>

          <div className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-md text-sm text-gray-600">
            Fast Diagnosis
          </div>

        </div>

      </div>

      {/* HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-20">

        {/* LEFT CONTENT */}
        <div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-md mb-8">

            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

            <p className="text-sm text-gray-600">
              Smart AI Healthcare Assistant
            </p>

          </div>

          <h1 className="text-5xl sm:text-7xl font-bold text-[#14245C] leading-[1.1]">

            Intelligent Disease Prediction

          </h1>

          <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-xl">

            Advanced AI-powered healthcare system that analyzes symptoms, predicts diseases, evaluates risk levels, and generates personalized prevention guidance instantly.

          </p>

          {/* BUTTONS */}
          <div className="flex flex-wrap items-center gap-5 mt-10">

            <button
              onClick={() => {

                const isLoggedIn =
                  localStorage.getItem("isLoggedIn");

                if (!isLoggedIn) {

                  setCurrentPage("login");

                  return;
                }

                setCurrentPage("patient");
              }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] text-white font-semibold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3"
            >

              Start AI Analysis

              <ArrowRight size={20} />

            </button>

            <div className="px-6 py-4 rounded-2xl bg-white/70 backdrop-blur-md shadow-lg">

              <p className="text-sm text-gray-500">
                Prediction Accuracy
              </p>

              <h3 className="text-2xl font-bold text-[#14245C]">
                94.8%
              </h3>

            </div>

          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-5 mt-14">

            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg">

              <h2 className="text-3xl font-bold text-[#6478FF]">
                7+
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Diseases Covered
              </p>

            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg">

              <h2 className="text-3xl font-bold text-[#5EEAD4]">
                AI
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Smart Detection
              </p>

            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg">

              <h2 className="text-3xl font-bold text-[#14245C]">
                PDF
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Medical Reports
              </p>

            </div>

          </div>

        </div>

        {/* RIGHT VISUAL */}
        <div className="relative flex justify-center">

          {/* MAIN CARD */}
          <div className="w-full max-w-[420px] h-[420px] sm:h-[500px] rounded-[40px] bg-gradient-to-br from-[#6478FF] to-[#5EEAD4] shadow-[0_25px_80px_rgba(100,120,255,0.35)] relative overflow-hidden">

            {/* FLOATING CIRCLE */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/20 rounded-full"></div>

            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full"></div>

            {/* CONTENT */}
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">

              <div className="flex items-center justify-between">

                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-sm">
                  AI Monitoring
                </div>

                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl">
                  ❤
                </div>

              </div>

              {/* CENTER */}
              <div className="text-center">

                <div className="w-44 h-44 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center shadow-2xl">

                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-4xl sm:text-6xl text-[#6478FF]">
                    +
                  </div>

                </div>

                <h2 className="text-4xl font-bold text-white mt-10">
                  AI Diagnosis
                </h2>

                <p className="text-white/80 mt-4 leading-relaxed px-8">
                  Real-time intelligent healthcare analysis powered by machine learning.
                </p>

              </div>

              {/* BOTTOM GLASS CARD */}
              <div className="bg-white/20 backdrop-blur-md rounded-3xl p-5 flex items-center justify-between">

                <div>

                  <p className="text-white/70 text-sm">
                    System Status
                  </p>

                  <h3 className="text-white text-xl font-bold mt-1">
                    Online
                  </h3>

                </div>

                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
)}

      {/* PATIENT PAGE */}
{currentPage === "patient" && (

  <div className="min-h-screen animate-fadeIn bg-gradient-to-br from-[#F4F7FF] via-[#EEF4FF] to-[#E6F7FF] px-4 sm:px-6 py-6 sm:py-10">

    <div className="max-w-6xl mx-auto">

      {/* TOP SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        <div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-md mb-5">

            <div className="w-3 h-3 bg-[#6478FF] rounded-full animate-pulse"></div>

            <p className="text-sm text-gray-600">
              Step 1 of 3
            </p>

          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#14245C] leading-tight">
            Patient Information
          </h1>

          <p className="mt-5 text-lg text-gray-600 max-w-2xl leading-relaxed">
            Enter patient details to begin intelligent AI-powered healthcare analysis and disease prediction.
          </p>

        </div>

        {/* PROGRESS CARD */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl min-w-[280px]">

          <p className="text-gray-500 text-sm">
            Analysis Progress
          </p>

          <div className="w-full h-3 rounded-full bg-[#E5ECFF] mt-4 overflow-hidden">

            <div className="w-[33%] h-full bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] rounded-full"></div>

          </div>

          <div className="flex justify-between mt-5 text-sm">

            <span className="text-[#6478FF] font-semibold">
              Patient
            </span>

            <span className="text-gray-400">
              Symptoms
            </span>

            <span className="text-gray-400">
              Results
            </span>

          </div>

        </div>

      </div>

      {/* MAIN FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 mt-14">

        {/* LEFT FORM CARD */}
        <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-10 shadow-[0_20px_60px_rgba(100,120,255,0.15)] transition-all duration-300 hover:-translate-y-1 border border-white/40">

          <div className="grid md:grid-cols-2 gap-8">

            {/* AGE */}
            <div>

              <label className="block text-gray-600 font-medium mb-3">
                Patient Age
              </label>

              <input
                type="number"
                value={age}
                onChange={(e) =>
                  setAge(e.target.value)
                }
                placeholder="Enter age"
                className="w-full p-5 rounded-2xl bg-[#F5F7FC] border border-[#E3E9F8] outline-none focus:border-[#6478FF] transition-all"
              />

            </div>

            {/* GENDER */}
            <div>

              <label className="block text-gray-600 font-medium mb-3">
                Gender
              </label>

              <select
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value)
                }
                className="w-full p-5 rounded-2xl bg-[#F5F7FC] border border-[#E3E9F8] outline-none focus:border-[#6478FF] transition-all"
              >

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

              </select>

            </div>

          </div>

          {/* TEMPERATURE */}
          <div className="mt-8">

            <label className="block text-gray-600 font-medium mb-3">
              Body Temperature (°F)
            </label>

            <input
              type="number"
              value={temperature}
              onChange={(e) =>
                setTemperature(e.target.value)
              }
              placeholder="Enter body temperature"
              className="w-full p-5 rounded-2xl bg-[#F5F7FC] border border-[#E3E9F8] outline-none focus:border-[#6478FF] transition-all"
            />

          </div>

          {/* BUTTON */}
          <button
            onClick={() =>
              setCurrentPage("symptoms")
            }
            className="mt-10 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] text-white font-semibold shadow-[0_15px_40px_rgba(100,120,255,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3"
          >

            Continue to Symptoms

            <ArrowRight size={20} />

          </button>

        </div>

        {/* RIGHT SIDE INFO */}
        <div className="space-y-6">

          {/* AI CARD */}
          <div className="bg-gradient-to-br from-[#6478FF] to-[#5EEAD4] rounded-[40px] p-8 shadow-[0_25px_80px_rgba(100,120,255,0.35)] text-white relative overflow-hidden">

            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full"></div>

            <div className="relative z-10">

              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
                +
              </div>

              <h2 className="text-3xl font-bold mt-8">
                Smart AI Analysis
              </h2>

              <p className="text-white/80 mt-5 leading-relaxed">
                Our machine learning model processes patient information and symptoms to generate intelligent healthcare insights and disease risk predictions.
              </p>

            </div>

          </div>

          {/* FEATURES */}
          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-8 shadow-xl">

            <h3 className="text-2xl font-bold text-[#14245C]">
              System Features
            </h3>

            <div className="space-y-5 mt-8">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] flex items-center justify-center text-[#6478FF] text-xl">
                  ✓
                </div>

                <div>

                  <h4 className="font-semibold text-[#14245C]">
                    AI Disease Prediction
                  </h4>

                  <p className="text-sm text-gray-500">
                    Smart ML-based diagnosis engine
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-[#EEFDFB] flex items-center justify-center text-[#5EEAD4] text-xl">
                  ✓
                </div>

                <div>

                  <h4 className="font-semibold text-[#14245C]">
                    Risk Analysis
                  </h4>

                  <p className="text-sm text-gray-500">
                    Dynamic confidence evaluation
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] flex items-center justify-center text-[#6478FF] text-xl">
                  ✓
                </div>

                <div>

                  <h4 className="font-semibold text-[#14245C]">
                    PDF Reports
                  </h4>

                  <p className="text-sm text-gray-500">
                    Downloadable healthcare reports
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
)}

      {/* SYMPTOMS PAGE */}
{currentPage === "symptoms" && (

  <div className="min-h-screen animate-fadeIn bg-gradient-to-br from-[#F4F7FF] via-[#EEF4FF] to-[#E6F7FF] px-4 sm:px-6 py-6 sm:py-10">

    <div className="max-w-7xl mx-auto">

      {/* TOP SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

        <div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-md mb-5">

            <div className="w-3 h-3 bg-[#6478FF] rounded-full animate-pulse"></div>

            <p className="text-sm text-gray-600">
              Step 2 of 3
            </p>

          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#14245C] leading-tight">
            Symptom Analysis
          </h1>

          <p className="mt-5 text-lg text-gray-600 max-w-3xl leading-relaxed">
            Select all symptoms currently experienced by the patient to enable accurate AI-powered disease prediction and healthcare analysis.
          </p>

        </div>

        {/* PROGRESS + COUNT */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl min-w-[320px]">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 text-sm">
                Selected Symptoms
              </p>

              <h2 className="text-4xl font-bold text-[#6478FF] mt-2">
                {selectedSymptoms.length}
              </h2>

            </div>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] flex items-center justify-center text-white text-3xl shadow-xl">
              +
            </div>

          </div>

          {/* PROGRESS */}
          <div className="w-full h-3 rounded-full bg-[#E5ECFF] mt-6 overflow-hidden">

            <div className="w-[66%] h-full bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] rounded-full"></div>

          </div>

          <div className="flex justify-between mt-5 text-sm">

            <span className="text-gray-400">
              Patient
            </span>

            <span className="text-[#6478FF] font-semibold">
              Symptoms
            </span>

            <span className="text-gray-400">
              Results
            </span>

          </div>

        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.5fr] gap-10 mt-14">

        {/* SYMPTOM CARDS */}
        <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-8 shadow-[0_20px_60px_rgba(100,120,255,0.15)] transition-all duration-300 hover:-translate-y-1 border border-white/40">

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {symptoms.map((symptom, index) => (

              <div
                key={index}
                onClick={() =>
                  handleSymptomChange(symptom.value)
                }
                className={`rounded-3xl p-6 cursor-pointer transition-all duration-300 border-2 relative overflow-hidden
                  
                  ${
                    selectedSymptoms.includes(symptom.value)
                      ? "bg-gradient-to-br from-[#6478FF] to-[#5EEAD4] text-white border-transparent shadow-[0_20px_50px_rgba(100,120,255,0.35)] scale-[1.02]"
                      : "bg-[#F7F9FF] border-[#E5ECFF] hover:border-[#6478FF] hover:shadow-lg hover:-translate-y-1"
                  }
                  `}
              >

                {/* GLOW */}
                {selectedSymptoms.includes(symptom.value) && (

                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full"></div>

                )}

                <div className="relative z-10">

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5
                      
                      ${
                        selectedSymptoms.includes(symptom.value)
                          ? "bg-white/20 backdrop-blur-md"
                          : "bg-[#EEF4FF] text-[#6478FF]"
                      }
                      `}
                  >
                    +
                  </div>

                  <h3 className="text-lg font-bold leading-snug">

                    {symptom.label}

                  </h3>

                  <p
                    className={`text-sm mt-3
                      
                      ${
                        selectedSymptoms.includes(symptom.value)
                          ? "text-white/80"
                          : "text-gray-500"
                      }
                      `}
                  >

                    AI will analyze this symptom during diagnosis.

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* RIGHT SIDE PANEL */}
        <div className="space-y-6">

          {/* INFO CARD */}
          <div className="bg-gradient-to-br from-[#6478FF] to-[#5EEAD4] rounded-[40px] p-8 shadow-[0_25px_80px_rgba(100,120,255,0.35)] text-white relative overflow-hidden">

            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full"></div>

            <div className="relative z-10">

              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
                +
              </div>

              <h2 className="text-3xl font-bold mt-8">
                AI Diagnosis Engine
              </h2>

              <p className="text-white/80 mt-5 leading-relaxed">
                Our machine learning system evaluates symptom combinations, patient data, and risk patterns to generate intelligent disease predictions.
              </p>

            </div>

          </div>

          {/* SUMMARY CARD */}
          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-8 shadow-xl">

            <h3 className="text-2xl font-bold text-[#14245C]">
              Diagnosis Summary
            </h3>

            <div className="space-y-5 mt-8">

              <div className="flex items-center justify-between">

                <p className="text-gray-500">
                  Patient Age
                </p>

                <h4 className="font-bold text-[#14245C]">
                  {age || "--"}
                </h4>

              </div>

              <div className="flex items-center justify-between">

                <p className="text-gray-500">
                  Gender
                </p>

                <h4 className="font-bold text-[#14245C]">
                  {gender}
                </h4>

              </div>

              <div className="flex items-center justify-between">

                <p className="text-gray-500">
                  Temperature
                </p>

                <h4 className="font-bold text-[#14245C]">
                  {temperature || "--"} °F
                </h4>

              </div>

              <div className="flex items-center justify-between">

                <p className="text-gray-500">
                  Symptoms Selected
                </p>

                <h4 className="font-bold text-[#6478FF]">
                  {selectedSymptoms.length}
                </h4>

              </div>

            </div>

            {/* BUTTON */}
            <button
              onClick={handlePrediction}
              className="w-full mt-10 px-8 py-5 rounded-2xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] text-white font-semibold shadow-[0_15px_40px_rgba(100,120,255,0.35)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
            >

              Run AI Diagnosis

              <ArrowRight size={20} />

            </button>

          </div>

        </div>

      </div>

    </div>

  </div>
)}

      {/* LOADING PAGE */}
{currentPage === "loading" && (

  <div className="min-h-screen animate-fadeIn bg-gradient-to-br from-[#F4F7FF] via-[#EEF4FF] to-[#E6F7FF] flex items-center justify-center px-6">

    <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">

      {/* LEFT SECTION */}
      <div>

        {/* BADGE */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-md mb-8">

          <div className="w-3 h-3 bg-[#6478FF] rounded-full animate-pulse"></div>

          <p className="text-sm text-gray-600">
            AI Diagnosis In Progress
          </p>

        </div>

        {/* TITLE */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#14245C] leading-tight">

          Analyzing Patient Health Data

        </h1>

        <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">

          Our AI healthcare engine is processing symptoms, evaluating disease patterns, calculating risk scores, and generating intelligent healthcare insights.

        </p>

        {/* STEPS */}
        <div className="space-y-5 mt-12">

          {/* STEP */}
          <div className="flex items-center gap-5 bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] flex items-center justify-center text-white text-xl animate-pulse">
              ✓
            </div>

            <div>

              <h3 className="font-bold text-[#14245C] text-lg">
                Reading Patient Data
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Processing patient information and healthcare parameters
              </p>

            </div>

          </div>

          {/* STEP */}
          <div className="flex items-center gap-5 bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] flex items-center justify-center text-white text-xl animate-pulse">
              ✓
            </div>

            <div>

              <h3 className="font-bold text-[#14245C] text-lg">
                Matching Disease Patterns
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                AI model comparing symptom combinations and medical patterns
              </p>

            </div>

          </div>

          {/* STEP */}
          <div className="flex items-center gap-5 bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] flex items-center justify-center text-white text-xl animate-pulse">
              ✓
            </div>

            <div>

              <h3 className="font-bold text-[#14245C] text-lg">
                Calculating Risk Levels
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Evaluating confidence scores and prediction probabilities
              </p>

            </div>

          </div>

          {/* STEP */}
          <div className="flex items-center gap-5 bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-lg">

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] flex items-center justify-center text-white text-xl animate-pulse">
              ✓
            </div>

            <div>

              <h3 className="font-bold text-[#14245C] text-lg">
                Generating Healthcare Report
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Preparing intelligent medical analysis and prevention guidance
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* RIGHT VISUAL */}
      <div className="relative flex justify-center">

        {/* MAIN AI CARD */}
        <div className="w-full max-w-[420px] h-[460px] sm:h-[520px] rounded-[45px] bg-gradient-to-br from-[#6478FF] to-[#5EEAD4] shadow-[0_25px_80px_rgba(100,120,255,0.35)] relative overflow-hidden">

          {/* FLOATING SHAPES */}
          <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full"></div>

          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full"></div>

          {/* CONTENT */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-10">

            {/* OUTER RING */}
            <div className="relative">

              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-[16px] border-white/20 flex items-center justify-center animate-spin"
                style={{ animationDuration: "10s" }}
              >

                {/* INNER RING */}
                <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full border-[12px] border-white/30 flex items-center justify-center animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "6s"
                  }}
                >

                  {/* CORE */}
                  <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center text-3xl sm:text-5xl text-[#6478FF] shadow-2xl">

                    +

                  </div>

                </div>

              </div>

              {/* PING */}
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>

            </div>

            {/* STATUS */}
            <div className="mt-14 text-center">

              <h2 className="text-4xl font-bold text-white">
                AI Diagnosis Engine
              </h2>

              <p className="text-white/80 mt-4 leading-relaxed max-w-sm">
                Machine learning algorithms are analyzing healthcare patterns in real time.
              </p>
              <div className="mt-8 flex items-center gap-3 bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl">

                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>

                  <p className="text-white text-sm">
                    AI Engine Running...
                  </p>

                </div>

            </div>

            {/* PROGRESS BAR */}
            <div className="w-full mt-12">

              <div className="flex items-center justify-between text-white/80 text-sm mb-3">

                <span>
                  Processing
                </span>

                <span>
                  98%
                </span>

              </div>

              <div className="w-full h-4 rounded-full bg-white/20 overflow-hidden">

                <div className="w-[98%] h-full bg-white rounded-full animate-pulse"></div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
)}

      {/* RESULT PAGE */}
{currentPage === "result" && (

  <div className="min-h-screen animate-fadeIn bg-gradient-to-br from-[#F4F7FF] via-[#EEF4FF] to-[#E6F7FF] px-4 sm:px-6 py-6 sm:py-10">

    <div className="max-w-7xl mx-auto">

      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

        <div>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-md mb-5">

            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

            <p className="text-sm text-gray-600">
              AI Diagnosis Completed
            </p>

          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#14245C] leading-tight">
            Healthcare Analysis Result
          </h1>

          <p className="mt-5 text-lg text-gray-600 max-w-3xl leading-relaxed">
            The AI healthcare engine has completed disease analysis, risk evaluation, and intelligent healthcare prediction successfully.
          </p>

        </div>

        {/* CONFIDENCE CARD */}
        <div className="bg-white/70 backdrop-blur-md rounded-[36px] p-6 shadow-xl min-w-[320px]">

          <p className="text-gray-500 text-sm">
            Prediction Confidence
          </p>

          <div className="flex items-center justify-between mt-6">

            <div>

              <h2 className="text-3xl sm:text-5xl font-bold text-[#6478FF]">
                {predictionConfidence}%
              </h2>

              <p className="text-gray-500 mt-2">
                AI Prediction Accuracy
              </p>

            </div>

            {/* CIRCLE */}
            <div className="relative w-24 h-24">

              <div className="absolute inset-0 rounded-full border-[10px] border-[#E5ECFF]"></div>

              <div
                className="absolute inset-0 rounded-full border-[10px] border-[#6478FF] border-t-transparent rotate-45"
              ></div>

              <div className="absolute inset-0 flex items-center justify-center text-[#6478FF] font-bold text-xl">

                AI

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-10 mt-14">

        {/* LEFT SIDE */}
        <div className="space-y-8">

          {/* DISEASE CARD */}
          <div className="bg-gradient-to-br from-[#6478FF] to-[#5EEAD4] rounded-[40px] p-10 shadow-[0_25px_80px_rgba(100,120,255,0.35)] text-white relative overflow-hidden">

            <div className="absolute top-0 right-0 w-52 h-52 bg-white/10 rounded-full"></div>

            <div className="relative z-10">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-white/80 text-sm">
                    Most Likely Disease
                  </p>

                  <h1 className="text-3xl sm:text-5xl font-bold capitalize mt-4">
                    {prediction}
                  </h1>

                </div>

                <div className="w-24 h-24 rounded-[30px] bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl sm:text-5xl">
                  +
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">

                <div className="bg-white/15 backdrop-blur-md rounded-3xl p-5">

                  <p className="text-white/70 text-sm">
                    Confidence
                  </p>

                  <h3 className="text-3xl font-bold mt-2">
                    {predictionConfidence}%
                  </h3>

                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-3xl p-5">

                  <p className="text-white/70 text-sm">
                    Risk Level
                  </p>

                  <h3 className="text-3xl font-bold mt-2">

                    {
                      predictionConfidence >= 70
                        ? "High"
                        : predictionConfidence >= 40
                        ? "Medium"
                        : "Low"
                    }

                  </h3>

                </div>

                <div className="bg-white/15 backdrop-blur-md rounded-3xl p-5">

                  <p className="text-white/70 text-sm">
                    AI Status
                  </p>

                  <h3 className="text-3xl font-bold mt-2">
                    Active
                  </h3>

                </div>

              </div>

            </div>

          </div>

          {/* CHART CARD */}
          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-8 shadow-[0_20px_60px_rgba(100,120,255,0.15)] transition-all duration-300 hover:-translate-y-1 border border-white/40">

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-3xl font-bold text-[#14245C]">
                  Disease Probability Analysis
                </h2>

                <p className="text-gray-500 mt-2">
                  AI comparison of top disease predictions
                </p>

              </div>

              <div className="px-5 py-3 rounded-2xl bg-[#EEF4FF] text-[#6478FF] font-semibold">
                Top 3 Predictions
              </div>

            </div>

            <div className="bg-[#F7F9FF] rounded-[30px] p-6 h-[280px] sm:h-[380px]">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={topPredictions}>

                  <XAxis dataKey="disease" />

                  <YAxis hide />

                  <Tooltip />

                  <Bar
                    dataKey="confidence"
                    radius={[16, 16, 0, 0]}
                  >

                    {topPredictions.map((entry, index) => (

                      <Cell
                        key={index}
                        fill={
                          index === 0
                            ? "#6478FF"
                            : index === 1
                            ? "#5EEAD4"
                            : "#A5B4FC"
                        }
                      />

                    ))}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <button
              onClick={downloadPDF}
              className="py-5 rounded-3xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] text-white font-semibold shadow-[0_15px_40px_rgba(100,120,255,0.35)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
            >

              <Download size={20} />

              Download PDF Report

            </button>

            <button
              onClick={resetForm}
              className="py-5 rounded-3xl bg-white/70 backdrop-blur-md text-[#14245C] font-semibold shadow-[0_20px_60px_rgba(100,120,255,0.15)] hover:scale-[1.02] transition-all duration-300"
            >

              Start New Analysis

            </button>

            <button
              onClick={fetchHistory}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-semibold shadow-lg hover:scale-[1.02] transition-all"
            >
              View History
            </button>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-8">

          {/* PATIENT SNAPSHOT */}
          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-8 shadow-xl">

            <h2 className="text-2xl font-bold text-[#14245C]">
              Patient Snapshot
            </h2>

            <div className="space-y-5 mt-8">

              <div className="flex items-center justify-between">

                <p className="text-gray-500">
                  Age
                </p>

                <h4 className="font-bold text-[#14245C]">
                  {age}
                </h4>

              </div>

              <div className="flex items-center justify-between">

                <p className="text-gray-500">
                  Gender
                </p>

                <h4 className="font-bold text-[#14245C]">
                  {gender}
                </h4>

              </div>

              <div className="flex items-center justify-between">

                <p className="text-gray-500">
                  Temperature
                </p>

                <h4 className="font-bold text-[#14245C]">
                  {temperature} °F
                </h4>

              </div>

              <div className="flex items-center justify-between">

                <p className="text-gray-500">
                  Symptoms
                </p>

                <h4 className="font-bold text-[#6478FF]">
                  {selectedSymptoms.length}
                </h4>

              </div>

            </div>

          </div>

          {/* PREVENTION CARD */}
          <div className="bg-white/70 backdrop-blur-md rounded-[40px] p-8 shadow-xl">

            <h2 className="text-2xl font-bold text-[#14245C]">
              Prevention Guidance
            </h2>

            <div className="space-y-5 mt-8">

              {prevention.map((tip, index) => (

                <div
                  key={index}
                  className="bg-[#F7F9FF] rounded-3xl p-5 flex items-start gap-4"
                >

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#6478FF] to-[#5EEAD4] text-white flex items-center justify-center text-xl shrink-0">
                    ✓
                  </div>

                  <div>

                    <h4 className="font-semibold text-[#14245C]">
                      Healthcare Suggestion
                    </h4>

                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                      {tip}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
)}

{/* HISTORY PAGE */}
{currentPage === "history" && (

  <div className="min-h-screen bg-gradient-to-br from-[#020817] via-[#07152F] to-[#0A1F44] px-4 py-10">

    <div className="max-w-7xl mx-auto">

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white">
            Patient History
          </h1>

          <p className="text-gray-400 mt-2">
            Previous AI healthcare diagnoses and reports
          </p>

        </div>

        <button
          onClick={() => setCurrentPage("home")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-semibold"
        >
          New Analysis
        </button>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {historyData.length === 0 ? (

  <div className="col-span-full bg-white/5 border border-white/10 rounded-[30px] p-14 text-center">

    <div className="text-6xl mb-6">
      🩺
    </div>

    <h2 className="text-3xl font-bold text-white">
      No History Found
    </h2>

    <p className="text-gray-400 mt-4 max-w-lg mx-auto">
      Your AI healthcare predictions and medical reports will appear here after completing disease analysis.
    </p>

    <button
      onClick={() => setCurrentPage("home")}
      className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-semibold"
    >
      Start New Analysis
    </button>

  </div>

) : (

  historyData
    .slice()
    .reverse()
    .map((item, index) => (

          <div
            key={index}
            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[30px] p-4 sm:p-6 shadow-2xl overflow-hidden"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-400">
                  Predicted Disease
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-white capitalize mt-1 break-words">
                  {item.predicted_disease}
                </h2>

              </div>

              <div className={`px-4 py-2 rounded-xl text-sm font-semibold

                ${
                  item.risk_level === "High"
                  ? "bg-red-500/20 text-red-400"

                  : item.risk_level === "Medium"
                  ? "bg-yellow-500/20 text-yellow-300"

                  : "bg-green-500/20 text-green-400"
                }
              `}>

                {item.risk_level} Risk

              </div>

            </div>

            <div className="mt-6">

              <div className="flex justify-between text-sm mb-2">

                <span className="text-gray-400">
                  Confidence
                </span>

                <span className="text-white font-semibold">
                  {item.confidence}%
                </span>

              </div>

              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">

                <div
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4]"
                  style={{
                    width: `${item.confidence}%`
                  }}
                />

              </div>

            </div>

            <div className="mt-6">

              <p className="text-gray-400 text-sm mb-3">
                Symptoms
              </p>

              <div className="flex flex-wrap gap-2">

                {item.symptoms
                  .split(",")
                  .map((symptom, idx) => (

                  <span
                    key={idx}
                    className="px-3 py-2 rounded-xl bg-[#2563EB]/20 text-blue-300 text-sm"
                  >
                    {symptom}
                  </span>
                ))}
              </div>

            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center">

              <p className="text-gray-500 text-sm">
                {item.timestamp}
              </p>

              <div className="text-2xl">
                🩺
              </div>

            </div>

          </div>
        ))
      )}
      </div>

    </div>

  </div>
)}

    </div>
  </>
  );
}

export default App;