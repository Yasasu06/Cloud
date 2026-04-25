"""
Cloud Intelligence Platform v7.0 — Executive Edition
=====================================================

6 Focused Pages:
1. Home (with Analytics merged, clickable feature cards, animated counters)
2. Cloud Advisor (TCO + Recommendation + Industry unified wizard)
3. Migration Analyzer (Visual complexity gauge, timeline visualization)
4. Executive Summary (Fixed rendering, professional document styling)
5. Projection Simulator (Animated charts, scenario comparison)
6. Intelligence Feed (Impact badges, filtering)

Premium Features:
- Animated counters on stats
- Smooth page transitions
- Visual gauges and progress indicators
- Clickable navigation cards
- Professional hover effects
- Sophisticated CSS background patterns
- Consistent design system

Author: Yasaswi Dutta
Version: 7.0 Executive
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from io import StringIO
from datetime import datetime
import math

# ============================================================================
# PAGE CONFIG
# ============================================================================

st.set_page_config(
    page_title="Cloud Intelligence Platform",
    page_icon="☁️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================================
# SESSION STATE FOR NAVIGATION
# ============================================================================

if 'current_page' not in st.session_state:
    st.session_state.current_page = "🏠 Home"

def navigate_to(page):
    st.session_state.current_page = page

# ============================================================================
# PREMIUM CSS WITH ANIMATIONS AND BACKGROUNDS
# ============================================================================

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    
    /* ===== ANIMATED BACKGROUND ===== */
    .stApp {
        background: 
            radial-gradient(ellipse at 10% 10%, rgba(99, 102, 241, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 90%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
            linear-gradient(180deg, #050508 0%, #0a0a12 30%, #080810 70%, #050508 100%);
        background-attachment: fixed;
        min-height: 100vh;
    }
    
    /* Animated grid overlay */
    .stApp::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
            linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
        background-size: 60px 60px;
        pointer-events: none;
        z-index: 0;
    }
    
    /* ===== SIDEBAR ===== */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, rgba(10, 10, 18, 0.98) 0%, rgba(5, 5, 10, 0.98) 100%);
        border-right: 1px solid rgba(99, 102, 241, 0.1);
        backdrop-filter: blur(20px);
    }
    
    section[data-testid="stSidebar"] .stRadio > div {
        gap: 8px;
    }
    
    section[data-testid="stSidebar"] .stRadio > div > label {
        background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 14px;
        padding: 16px 20px;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
    }
    
    section[data-testid="stSidebar"] .stRadio > div > label::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
        transition: left 0.5s ease;
    }
    
    section[data-testid="stSidebar"] .stRadio > div > label:hover {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateX(8px);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
    }
    
    section[data-testid="stSidebar"] .stRadio > div > label:hover::before {
        left: 100%;
    }
    
    section[data-testid="stSidebar"] .stRadio > div > label[data-checked="true"] {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%);
        border-color: rgba(99, 102, 241, 0.5);
        box-shadow: 0 4px 25px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255,255,255,0.1);
    }
    
    /* ===== TYPOGRAPHY ===== */
    h1 {
        font-size: 2.5rem !important;
        font-weight: 800 !important;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 50%, #ffffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 3s ease-in-out infinite;
    }
    
    @keyframes shimmer {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.85; }
    }
    
    h2, h3 { color: #ffffff !important; font-weight: 600 !important; }
    h4 { color: #e0e0e0 !important; font-weight: 600 !important; }
    
    /* ===== METRICS WITH ANIMATION ===== */
    [data-testid="stMetric"] {
        background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 24px;
        backdrop-filter: blur(10px);
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
    }
    
    [data-testid="stMetric"]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
    }
    
    [data-testid="stMetric"]:hover {
        transform: translateY(-6px) scale(1.02);
        border-color: rgba(99, 102, 241, 0.4);
        box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 40px rgba(99, 102, 241, 0.1);
    }
    
    [data-testid="stMetricLabel"] {
        color: #888 !important;
        font-size: 0.75rem !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        letter-spacing: 0.15em;
    }
    
    [data-testid="stMetricValue"] {
        color: #fff !important;
        font-size: 2rem !important;
        font-weight: 700 !important;
    }
    
    [data-testid="stMetricDelta"] {
        font-weight: 600 !important;
    }
    
    /* ===== TABS ===== */
    .stTabs [data-baseweb="tab-list"] {
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        padding: 6px;
        gap: 6px;
        border: 1px solid rgba(255,255,255,0.06);
    }
    
    .stTabs [data-baseweb="tab"] {
        border-radius: 12px;
        color: #888;
        font-weight: 500;
        padding: 12px 24px;
        transition: all 0.3s ease;
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
        color: white !important;
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }
    
    /* ===== BUTTONS ===== */
    .stButton > button {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 14px 28px;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        position: relative;
        overflow: hidden;
    }
    
    .stButton > button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
    }
    
    .stButton > button:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
    }
    
    .stButton > button:hover::before {
        left: 100%;
    }
    
    /* ===== INPUTS ===== */
    .stNumberInput > div > div > input,
    .stTextInput > div > div > input {
        background: rgba(255,255,255,0.05) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 12px !important;
        color: white !important;
        padding: 14px !important;
        transition: all 0.3s ease !important;
    }
    
    .stNumberInput > div > div > input:focus,
    .stTextInput > div > div > input:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2) !important;
    }
    
    .stSelectbox > div > div {
        background: rgba(255,255,255,0.05) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 12px !important;
    }
    
    /* ===== SLIDERS ===== */
    .stSlider > div > div > div > div {
        background: linear-gradient(90deg, #6366f1, #8b5cf6) !important;
    }
    
    .stSlider > div > div > div > div > div {
        background: white !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
    }
    
    /* ===== CUSTOM COMPONENTS ===== */
    
    /* Hero Section */
    .hero-section {
        text-align: center;
        padding: 80px 40px;
        background: 
            radial-gradient(ellipse at top center, rgba(99, 102, 241, 0.2) 0%, transparent 60%),
            radial-gradient(ellipse at bottom center, rgba(139, 92, 246, 0.1) 0%, transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(255,255,255,0.01) 100%);
        border-radius: 32px;
        border: 1px solid rgba(255,255,255,0.08);
        margin-bottom: 50px;
        position: relative;
        overflow: hidden;
    }
    
    .hero-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent);
    }
    
    .hero-section::after {
        content: '';
        position: absolute;
        top: -150%;
        left: -50%;
        width: 200%;
        height: 400%;
        background: conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.03), transparent 30%);
        animation: rotate 20s linear infinite;
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .hero-badge {
        display: inline-block;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
        border: 1px solid rgba(99, 102, 241, 0.3);
        padding: 10px 24px;
        border-radius: 100px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #a5b4fc;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        margin-bottom: 28px;
        position: relative;
        z-index: 1;
        animation: pulse-badge 3s ease-in-out infinite;
    }
    
    @keyframes pulse-badge {
        0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
        50% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
    }
    
    .hero-title {
        font-size: 4rem;
        font-weight: 800;
        background: linear-gradient(135deg, #ffffff 0%, #6366f1 40%, #a855f7 70%, #ffffff 100%);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 24px;
        letter-spacing: -0.03em;
        position: relative;
        z-index: 1;
        animation: gradient-shift 5s ease infinite;
    }
    
    @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    
    .hero-subtitle {
        font-size: 1.3rem;
        color: #9ca3af;
        max-width: 700px;
        margin: 0 auto 36px;
        line-height: 1.8;
        position: relative;
        z-index: 1;
    }
    
    .live-indicator {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
        border: 1px solid rgba(34, 197, 94, 0.25);
        padding: 12px 24px;
        border-radius: 100px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #22c55e;
        position: relative;
        z-index: 1;
    }
    
    .live-dot {
        width: 10px;
        height: 10px;
        background: #22c55e;
        border-radius: 50%;
        animation: pulse-dot 2s ease-in-out infinite;
        box-shadow: 0 0 15px #22c55e;
    }
    
    @keyframes pulse-dot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.4); opacity: 0.7; }
    }
    
    /* Animated Counter */
    .animated-stat {
        text-align: center;
        padding: 20px;
        position: relative;
        z-index: 1;
    }
    
    .stat-value {
        font-size: 3.5rem;
        font-weight: 800;
        color: white;
        line-height: 1;
        margin-bottom: 8px;
    }
    
    .stat-label {
        font-size: 0.85rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-weight: 500;
    }
    
    /* Feature Cards - Clickable */
    .feature-card {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 24px;
        padding: 32px 24px;
        text-align: center;
        transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    
    .feature-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, #6366f1, transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .feature-card:hover {
        transform: translateY(-12px) scale(1.03);
        box-shadow: 0 30px 60px rgba(99, 102, 241, 0.25), 0 0 50px rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.5);
    }
    
    .feature-card:hover::before {
        opacity: 1;
    }
    
    .feature-icon {
        font-size: 3.5rem;
        margin-bottom: 20px;
        display: block;
    }
    
    .feature-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
        margin-bottom: 10px;
    }
    
    .feature-desc {
        font-size: 0.9rem;
        color: #888;
        line-height: 1.6;
    }
    
    .feature-arrow {
        margin-top: 16px;
        color: #6366f1;
        font-size: 1.2rem;
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.3s ease;
    }
    
    .feature-card:hover .feature-arrow {
        opacity: 1;
        transform: translateX(0);
    }
    
    /* Standard Cards */
    .card {
        background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 28px;
        margin-bottom: 20px;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
    }
    
    .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    }
    
    .card:hover {
        transform: translateY(-4px);
        border-color: rgba(99, 102, 241, 0.3);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 30px rgba(99, 102, 241, 0.08);
    }
    
    .card-aws { border-left: 4px solid #ff9900; }
    .card-azure { border-left: 4px solid #0078d4; }
    .card-gcp { border-left: 4px solid #34a853; }
    
    /* Stock Cards */
    .stock-card {
        background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 14px;
        transition: all 0.3s ease;
    }
    
    .stock-card:hover {
        background: rgba(255,255,255,0.06);
        transform: scale(1.02);
        border-color: rgba(255,255,255,0.15);
    }
    
    .stock-ticker {
        font-size: 0.75rem;
        color: #666;
        font-weight: 600;
        letter-spacing: 0.1em;
    }
    
    .stock-price {
        font-size: 1.7rem;
        font-weight: 700;
        color: white;
        margin: 6px 0;
    }
    
    .stock-change { font-weight: 600; font-size: 0.95rem; }
    .stock-up { color: #22c55e; }
    .stock-down { color: #ef4444; }
    
    /* Section Headers */
    .section-header {
        font-size: 0.7rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        margin-bottom: 24px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .section-header::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, rgba(255,255,255,0.1), transparent);
    }
    
    /* Dividers */
    .divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        margin: 50px 0;
    }
    
    /* Insight Boxes */
    .insight-box {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.03) 100%);
        border: 1px solid rgba(34, 197, 94, 0.2);
        border-radius: 18px;
        padding: 24px;
        margin: 16px 0;
        transition: all 0.3s ease;
    }
    
    .insight-box:hover {
        transform: translateX(4px);
        border-color: rgba(34, 197, 94, 0.4);
    }
    
    .insight-title {
        color: #22c55e;
        font-size: 0.95rem;
        font-weight: 600;
        margin-bottom: 10px;
    }
    
    .insight-text {
        color: #b0b0b0;
        font-size: 0.95rem;
        line-height: 1.7;
    }
    
    /* TCO Results */
    .tco-result {
        background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        padding: 40px 30px;
        text-align: center;
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
    }
    
    .tco-result::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--provider-color), transparent);
    }
    
    .tco-result:hover {
        transform: scale(1.03);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    
    .tco-provider {
        font-size: 0.85rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        margin-bottom: 12px;
    }
    
    .tco-amount {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 8px;
    }
    
    .tco-aws { --provider-color: #ff9900; }
    .tco-aws .tco-amount { color: #ff9900; }
    .tco-azure { --provider-color: #0078d4; }
    .tco-azure .tco-amount { color: #0078d4; }
    .tco-gcp { --provider-color: #34a853; }
    .tco-gcp .tco-amount { color: #34a853; }
    
    .tco-savings {
        font-size: 1rem;
        color: #22c55e;
        font-weight: 600;
        margin-top: 8px;
    }
    
    .winner-badge {
        display: inline-block;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        padding: 8px 20px;
        border-radius: 100px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-top: 16px;
        box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
        animation: winner-glow 2s ease-in-out infinite;
    }
    
    @keyframes winner-glow {
        0%, 100% { box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4); }
        50% { box-shadow: 0 4px 30px rgba(34, 197, 94, 0.6); }
    }
    
    /* Wizard Progress */
    .wizard-container {
        margin-bottom: 40px;
    }
    
    .wizard-steps {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
    }
    
    .wizard-step {
        width: 60px;
        height: 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
        transition: all 0.5s ease;
        position: relative;
    }
    
    .wizard-step.active {
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
    }
    
    .wizard-step.completed {
        background: linear-gradient(90deg, #22c55e, #16a34a);
    }
    
    .wizard-labels {
        display: flex;
        justify-content: center;
        gap: 30px;
    }
    
    .wizard-label {
        font-size: 0.75rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: color 0.3s ease;
    }
    
    .wizard-label.active {
        color: #a5b4fc;
    }
    
    .wizard-label.completed {
        color: #22c55e;
    }
    
    /* Complexity Gauge */
    .gauge-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px;
    }
    
    .gauge-circle {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: conic-gradient(
            var(--gauge-color) calc(var(--gauge-percent) * 1%),
            rgba(255,255,255,0.1) calc(var(--gauge-percent) * 1%)
        );
        animation: gauge-fill 1.5s ease-out;
    }
    
    @keyframes gauge-fill {
        from { 
            background: conic-gradient(var(--gauge-color) 0%, rgba(255,255,255,0.1) 0%);
        }
    }
    
    .gauge-inner {
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0a0a12, #12121a);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .gauge-value {
        font-size: 3.5rem;
        font-weight: 800;
        color: var(--gauge-color);
    }
    
    .gauge-label {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--gauge-color);
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    
    .gauge-easy { --gauge-color: #22c55e; --gauge-percent: 30; }
    .gauge-medium { --gauge-color: #eab308; --gauge-percent: 60; }
    .gauge-hard { --gauge-color: #ef4444; --gauge-percent: 85; }
    
    /* Timeline */
    .timeline {
        position: relative;
        padding-left: 30px;
    }
    
    .timeline::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(180deg, #6366f1, #8b5cf6, #22c55e);
    }
    
    .timeline-item {
        position: relative;
        padding: 20px 0 20px 30px;
        opacity: 0;
        animation: timeline-appear 0.5s ease forwards;
    }
    
    .timeline-item:nth-child(1) { animation-delay: 0.1s; }
    .timeline-item:nth-child(2) { animation-delay: 0.2s; }
    .timeline-item:nth-child(3) { animation-delay: 0.3s; }
    .timeline-item:nth-child(4) { animation-delay: 0.4s; }
    .timeline-item:nth-child(5) { animation-delay: 0.5s; }
    
    @keyframes timeline-appear {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    .timeline-dot {
        position: absolute;
        left: -26px;
        top: 24px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border: 3px solid #0a0a12;
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
    }
    
    .timeline-content {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 20px;
    }
    
    .timeline-phase {
        font-size: 1rem;
        font-weight: 600;
        color: white;
        margin-bottom: 4px;
    }
    
    .timeline-duration {
        font-size: 0.85rem;
        color: #6366f1;
        font-weight: 500;
        margin-bottom: 8px;
    }
    
    .timeline-desc {
        font-size: 0.9rem;
        color: #888;
        line-height: 1.5;
    }
    
    /* Executive Summary Document */
    .exec-document {
        background: linear-gradient(135deg, #0f0f1a 0%, #0a0a14 100%);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 60px;
        margin: 30px 0;
        position: relative;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    
    .exec-document::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
    }
    
    .exec-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 40px;
        padding-bottom: 30px;
        border-bottom: 2px solid rgba(255,255,255,0.1);
    }
    
    .exec-logo {
        font-size: 1.5rem;
        font-weight: 800;
        color: white;
    }
    
    .exec-meta {
        text-align: right;
        color: #666;
        font-size: 0.9rem;
        line-height: 1.6;
    }
    
    .exec-title {
        font-size: 2rem;
        font-weight: 700;
        color: white;
        margin-bottom: 8px;
    }
    
    .exec-subtitle {
        font-size: 1.1rem;
        color: #888;
        margin-bottom: 40px;
    }
    
    .exec-section {
        margin-bottom: 36px;
    }
    
    .exec-section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #6366f1;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .exec-section-content {
        color: #ccc;
        font-size: 1rem;
        line-height: 1.8;
    }
    
    .exec-highlight {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05));
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 12px;
        padding: 24px;
        margin: 20px 0;
    }
    
    .exec-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin: 24px 0;
    }
    
    .exec-metric {
        background: rgba(255,255,255,0.03);
        border-radius: 12px;
        padding: 24px;
        text-align: center;
    }
    
    .exec-metric-value {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 4px;
    }
    
    .exec-metric-label {
        font-size: 0.8rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    
    .exec-footer {
        margin-top: 50px;
        padding-top: 30px;
        border-top: 2px solid rgba(255,255,255,0.1);
        display: flex;
        justify-content: space-between;
        color: #666;
        font-size: 0.85rem;
    }
    
    /* News Feed */
    .news-item {
        background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 16px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .news-item:hover {
        background: rgba(255,255,255,0.06);
        transform: translateX(8px);
        border-color: rgba(255,255,255,0.12);
    }
    
    .news-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: var(--news-color);
    }
    
    .news-aws { --news-color: #ff9900; }
    .news-azure { --news-color: #0078d4; }
    .news-gcp { --news-color: #34a853; }
    
    .news-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .news-date {
        font-size: 0.8rem;
        color: #666;
    }
    
    .news-impact {
        padding: 4px 12px;
        border-radius: 100px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .news-impact-high {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        animation: pulse-impact 2s ease-in-out infinite;
    }
    
    @keyframes pulse-impact {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    .news-impact-medium {
        background: rgba(234, 179, 8, 0.15);
        color: #eab308;
    }
    
    .news-impact-low {
        background: rgba(34, 197, 94, 0.15);
        color: #22c55e;
    }
    
    .news-title {
        font-size: 1.05rem;
        font-weight: 600;
        color: white;
        margin-bottom: 10px;
        line-height: 1.4;
    }
    
    .news-provider {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .news-provider-aws { background: rgba(255, 153, 0, 0.15); color: #ff9900; }
    .news-provider-azure { background: rgba(0, 120, 212, 0.15); color: #0078d4; }
    .news-provider-gcp { background: rgba(52, 168, 83, 0.15); color: #34a853; }
    
    /* Data Freshness */
    .data-freshness {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 12px;
        padding: 14px 24px;
        font-size: 0.85rem;
        color: #a5b4fc;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 30px;
    }
    
    .data-freshness-dot {
        width: 8px;
        height: 8px;
        background: #6366f1;
        border-radius: 50%;
    }
    
    /* Confidence Display */
    .confidence-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 30px;
    }
    
    .confidence-circle {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        background: conic-gradient(
            var(--conf-color) calc(var(--conf-percent) * 1%),
            rgba(255,255,255,0.1) calc(var(--conf-percent) * 1%)
        );
    }
    
    .confidence-inner {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        background: linear-gradient(135deg, #0a0a12, #12121a);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .confidence-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: white;
    }
    
    .confidence-label {
        font-size: 0.7rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }
    
    /* Print Styles for Executive Summary */
    @media print {
        .stApp { background: white !important; }
        .exec-document { 
            box-shadow: none !important;
            border: 1px solid #ddd !important;
        }
        .exec-document::before { display: none; }
        * { color: #333 !important; }
        .exec-section-title { color: #6366f1 !important; }
    }
    
    /* Tooltip Styling */
    .tooltip-text {
        font-size: 0.8rem;
        color: #666;
        font-style: italic;
        margin-top: 6px;
        padding-left: 2px;
    }
    
    /* Comparison Bars */
    .comparison-bar {
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        height: 24px;
        position: relative;
        overflow: hidden;
        margin: 8px 0;
    }
    
    .comparison-fill {
        height: 100%;
        border-radius: 8px;
        transition: width 1s ease-out;
        position: relative;
    }
    
    .comparison-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        animation: shine 2s ease-in-out infinite;
    }
    
    @keyframes shine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    .comparison-label {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.8rem;
        font-weight: 600;
        color: white;
    }
</style>
""", unsafe_allow_html=True)

# ============================================================================
# DATA
# ============================================================================

MARKET_DATA = """Period,AWS_Revenue_Billion,Azure_Revenue_Billion,GCP_Revenue_Billion,Total_Market_Billion,AWS_Share_Pct,Azure_Share_Pct,GCP_Share_Pct,Others_Share_Pct,AWS_YoY_Growth_Pct,Azure_YoY_Growth_Pct,GCP_YoY_Growth_Pct
Q1 2022,18.4,11.9,5.8,53.0,35,22,11,32,36,38,45
Q2 2022,19.7,12.5,6.3,56.0,35,22,11,32,33,33,37
Q3 2022,20.5,13.1,6.9,59.0,35,22,12,31,27,27,38
Q4 2022,21.4,13.8,7.3,62.0,35,22,12,31,20,23,33
Q1 2023,21.4,14.5,7.5,65.0,33,22,12,33,16,22,29
Q2 2023,22.1,15.2,8.0,68.0,33,22,12,33,12,22,27
Q3 2023,23.1,16.0,8.4,71.0,33,23,12,32,13,22,22
Q4 2023,24.2,17.0,9.2,75.0,32,23,12,33,13,23,26
Q1 2024,25.0,18.2,9.6,79.0,32,23,12,33,17,26,28
Q2 2024,26.3,19.3,10.3,83.0,32,23,12,33,19,27,29
Q3 2024,27.5,20.5,11.4,88.0,31,23,13,33,19,28,36
Q4 2024,28.8,21.8,12.0,93.0,31,23,13,33,19,28,30
Q1 2025,29.9,23.1,13.2,99.0,30,23,13,34,20,27,38
Q2 2025,31.4,24.4,14.8,107.0,29,23,14,34,19,26,44
Q3 2025,33.0,25.8,16.2,115.0,29,22,14,35,20,26,42
Q4 2025,35.6,26.7,17.7,127.0,28,21,14,37,24,39,48"""

AI_CLOUD_DATA = """Period,Azure_AI_Revenue_B,AWS_AI_Revenue_B,GCP_AI_Revenue_B,Total_AI_Market_B
Q1 2023,1.2,2.1,0.8,4.1
Q2 2023,1.8,2.4,1.0,5.2
Q3 2023,2.4,2.8,1.3,6.5
Q4 2023,3.1,3.2,1.6,7.9
Q1 2024,4.2,3.8,2.0,10.0
Q2 2024,5.6,4.4,2.5,12.5
Q3 2024,7.1,5.1,3.1,15.3
Q4 2024,8.9,5.9,3.8,18.6
Q1 2025,10.8,6.8,4.6,22.2
Q2 2025,12.9,7.8,5.5,26.2
Q3 2025,15.2,8.9,6.5,30.6
Q4 2025,17.8,10.1,7.6,35.5"""

DATA_LAST_UPDATED = "January 2026"
DATA_SOURCE = "Company Earnings Reports, Synergy Research Group"

@st.cache_data
def load_data():
    return pd.read_csv(StringIO(MARKET_DATA))

@st.cache_data(ttl=3600)
def get_stocks():
    try:
        import yfinance as yf
        result = {}
        for ticker, name in [('AMZN', 'AWS'), ('MSFT', 'Azure'), ('GOOGL', 'GCP')]:
            stock = yf.Ticker(ticker)
            hist = stock.history(period='5d')
            if len(hist) >= 2:
                price = hist['Close'].iloc[-1]
                prev = hist['Close'].iloc[-2]
                change = ((price - prev) / prev) * 100
                result[name] = {'ticker': ticker, 'price': round(price, 2), 'change': round(change, 2)}
        return result if result else fallback_stocks()
    except:
        return fallback_stocks()

def fallback_stocks():
    return {
        'AWS': {'ticker': 'AMZN', 'price': 186.52, 'change': 1.34},
        'Azure': {'ticker': 'MSFT', 'price': 430.21, 'change': 0.92},
        'GCP': {'ticker': 'GOOGL', 'price': 173.45, 'change': -0.38}
    }

COLORS = {'AWS': '#FF9900', 'Azure': '#0078D4', 'GCP': '#34A853'}

# TCO Pricing (Q1 2025)
TCO_PRICING = {
    'compute': {'AWS': 0.0416, 'Azure': 0.0408, 'GCP': 0.0380},
    'storage': {'AWS': 0.10, 'Azure': 0.095, 'GCP': 0.085},
    'egress': {'AWS': 0.09, 'Azure': 0.087, 'GCP': 0.085},
    'database': {'AWS': 0.145, 'Azure': 0.136, 'GCP': 0.125},
    'support': {'AWS': 0.10, 'Azure': 0.00, 'GCP': 0.04}
}

RESERVED_DISCOUNT = {'AWS': 0.40, 'Azure': 0.38, 'GCP': 0.35}

# Industries (10 total)
INDUSTRIES = {
    'Healthcare': {'icon': '🏥', 'rec': 'Azure', 'conf': 87, 'compliance': ['HIPAA', 'HITECH', 'FDA 21 CFR Part 11'], 'reason': 'Microsoft Cloud for Healthcare and deep EHR integrations (Epic, Cerner) give Azure the edge in healthcare.'},
    'Finance': {'icon': '🏦', 'rec': 'Azure', 'conf': 89, 'compliance': ['SOC 1/2/3', 'PCI DSS', 'GLBA', 'FINRA'], 'reason': 'Existing Microsoft relationships and Azure Confidential Computing for sensitive financial workloads.'},
    'Retail': {'icon': '🛒', 'rec': 'GCP', 'conf': 82, 'compliance': ['PCI DSS', 'SOC 2', 'GDPR'], 'reason': 'Best analytics (BigQuery) and Recommendations AI. Some retailers avoid AWS due to Amazon competition.'},
    'Technology': {'icon': '💻', 'rec': 'AWS', 'conf': 85, 'compliance': ['SOC 2', 'ISO 27001'], 'reason': 'Broadest service catalog, mature DevOps ecosystem, and largest cloud talent pool available.'},
    'Government': {'icon': '🏛️', 'rec': 'Azure', 'conf': 91, 'compliance': ['FedRAMP High', 'ITAR', 'CJIS', 'DoD IL5'], 'reason': 'Most comprehensive government certifications and specialized Azure Government cloud regions.'},
    'Media': {'icon': '🎬', 'rec': 'AWS', 'conf': 84, 'compliance': ['MPAA', 'SOC 2'], 'reason': 'AWS Elemental dominates video streaming infrastructure. Netflix, Disney+, HBO Max all run on AWS.'},
    'Manufacturing': {'icon': '🏭', 'rec': 'Azure', 'conf': 83, 'compliance': ['ISO 27001', 'SOC 2'], 'reason': 'Azure IoT Hub and Digital Twins excel for Industry 4.0 and smart factory initiatives.'},
    'Education': {'icon': '🎓', 'rec': 'GCP', 'conf': 86, 'compliance': ['FERPA', 'COPPA'], 'reason': 'Google Workspace dominance in K-12 and higher education creates natural GCP pathway.'},
    'Energy': {'icon': '⚡', 'rec': 'Azure', 'conf': 81, 'compliance': ['NERC CIP', 'ISO 27001'], 'reason': 'Azure partnerships with major energy companies and specialized sustainability solutions.'},
    'Logistics': {'icon': '🚚', 'rec': 'AWS', 'conf': 83, 'compliance': ['SOC 2', 'ISO 27001'], 'reason': 'AWS supply chain and logistics solutions with global infrastructure for optimization.'}
}

# News Feed
NEWS_API_KEY = "pub_efab12ce94b8469eaa07491eeb0cdf98"  # Free key from newsdata.io

def fetch_live_news():
    """Fetch live cloud news from NewsData.io free API.
    Returns (articles, error_message). articles is None on failure."""
    import urllib.request
    import urllib.parse
    import urllib.error
    import json
    try:
        query = urllib.parse.quote("AWS OR Azure OR Google Cloud OR cloud computing")
        url = f"https://newsdata.io/api/1/news?apikey={NEWS_API_KEY}&q={query}&language=en&category=technology"
        req = urllib.request.urlopen(url, timeout=5)
        data = json.loads(req.read().decode())
        if data.get('status') != 'success':
            return None, f"API error: {data.get('message', 'unknown')}"
        articles = []
        for item in data.get('results', [])[:8]:
            provider = 'AWS'
            title_lower = item.get('title', '').lower()
            if 'azure' in title_lower or 'microsoft' in title_lower:
                provider = 'Azure'
            elif 'google cloud' in title_lower or 'gcp' in title_lower:
                provider = 'GCP'
            articles.append({
                'date': item.get('pubDate', '')[:10],
                'provider': provider,
                'title': item.get('title', ''),
                'impact': 'High' if any(w in title_lower for w in ['billion', 'major', 'launch', 'acquisition']) else 'Medium',
                'url': item.get('link', '')
            })
        return (articles, None) if articles else (None, "API returned no articles")
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors='ignore')
        if 'allowlist' in body.lower() or 'whitelist' in body.lower():
            return None, "Host not in allowlist — remove the domain restriction on your NewsData.io API key (dashboard → API Keys → edit)"
        return None, f"HTTP {e.code}: {body[:120]}"
    except Exception as e:
        return None, str(e)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_tco(vms, vcpus, storage_tb, egress_gb, db_hours, reserved=False):
    costs = {}
    for provider in ['AWS', 'Azure', 'GCP']:
        compute = vms * vcpus * 730 * TCO_PRICING['compute'][provider]
        storage = storage_tb * 1024 * TCO_PRICING['storage'][provider]
        egress = egress_gb * TCO_PRICING['egress'][provider]
        database = db_hours * TCO_PRICING['database'][provider]
        subtotal = compute + storage + egress + database
        if reserved:
            subtotal *= (1 - RESERVED_DISCOUNT[provider])
        support = subtotal * TCO_PRICING['support'][provider]
        costs[provider] = round(subtotal + support, 2)
    return costs

def calculate_migration_complexity(current_infra, workloads, data_size, integrations):
    base_score = 20
    
    if current_infra == 'On-Premises':
        base_score += 35
    elif current_infra == 'Colocation':
        base_score += 30
    elif current_infra in ['AWS', 'Azure', 'GCP']:
        base_score += 15
    else:
        base_score += 25
    
    complex_workloads = ['Legacy Applications', 'Mainframe', 'Custom Databases']
    for w in workloads:
        if w in complex_workloads:
            base_score += 12
        else:
            base_score += 5
    
    if data_size > 100:
        base_score += 20
    elif data_size > 50:
        base_score += 12
    elif data_size > 20:
        base_score += 6
    
    base_score += min(integrations * 2.5, 25)
    
    return min(100, int(base_score))

def get_recommendation(industry, size, usecase, budget, priority):
    weights = {'industry': 0.30, 'size': 0.20, 'usecase': 0.25, 'budget': 0.10, 'priority': 0.15}
    scores = {'AWS': 50, 'Azure': 50, 'GCP': 50}
    
    if industry in INDUSTRIES:
        rec = INDUSTRIES[industry]['rec']
        scores[rec] += 35 * weights['industry'] * 100 / 35
        others = [p for p in scores if p != rec]
        for p in others:
            scores[p] += 20 * weights['industry'] * 100 / 35
    
    size_matrix = {
        'Startup': {'AWS': 90, 'GCP': 85, 'Azure': 70},
        'SMB': {'AWS': 85, 'Azure': 80, 'GCP': 75},
        'Mid-Market': {'Azure': 88, 'AWS': 85, 'GCP': 80},
        'Enterprise': {'Azure': 92, 'AWS': 85, 'GCP': 75}
    }
    if size in size_matrix:
        for p, s in size_matrix[size].items():
            scores[p] += s * weights['size']
    
    usecase_matrix = {
        'AI/ML': {'GCP': 95, 'Azure': 90, 'AWS': 80},
        'Data Analytics': {'GCP': 95, 'AWS': 85, 'Azure': 80},
        'Web Hosting': {'AWS': 92, 'Azure': 85, 'GCP': 80},
        'DevOps': {'AWS': 90, 'GCP': 88, 'Azure': 85},
        'Security': {'Azure': 92, 'AWS': 88, 'GCP': 75},
        'Kubernetes': {'GCP': 95, 'AWS': 85, 'Azure': 85},
        'IoT': {'Azure': 92, 'AWS': 88, 'GCP': 75},
        'Serverless': {'AWS': 92, 'GCP': 88, 'Azure': 82}
    }
    if usecase in usecase_matrix:
        for p, s in usecase_matrix[usecase].items():
            scores[p] += s * weights['usecase']
    
    budget_matrix = {
        'Cost-first': {'GCP': 88, 'AWS': 80, 'Azure': 72},
        'Balanced': {'AWS': 85, 'Azure': 85, 'GCP': 85},
        'Performance-first': {'AWS': 90, 'Azure': 88, 'GCP': 85}
    }
    if budget in budget_matrix:
        for p, s in budget_matrix[budget].items():
            scores[p] += s * weights['budget']
    
    priority_matrix = {
        'Speed to Market': {'AWS': 90, 'Azure': 85, 'GCP': 82},
        'Cost Optimization': {'GCP': 92, 'AWS': 80, 'Azure': 75},
        'Scalability': {'AWS': 95, 'GCP': 90, 'Azure': 85},
        'Compliance': {'Azure': 95, 'AWS': 88, 'GCP': 72}
    }
    if priority in priority_matrix:
        for p, s in priority_matrix[priority].items():
            scores[p] += s * weights['priority']
    
    max_score = max(scores.values())
    for p in scores:
        scores[p] = min(98, int((scores[p] / max_score) * 95))
    
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return {'primary': ranked[0], 'secondary': ranked[1], 'tertiary': ranked[2], 'scores': scores}

def chart_layout(title='', height=400):
    return dict(
        title=dict(text=title, font=dict(size=18, color='#ffffff', family='Inter'), x=0),
        template='plotly_dark',
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=dict(family='Inter', color='#888', size=12),
        height=height,
        margin=dict(l=60, r=30, t=60, b=50),
        legend=dict(orientation='h', y=1.12, bgcolor='rgba(0,0,0,0)', font=dict(size=12)),
        xaxis=dict(gridcolor='rgba(255,255,255,0.05)', linecolor='rgba(255,255,255,0.1)', tickfont=dict(size=11)),
        yaxis=dict(gridcolor='rgba(255,255,255,0.05)', linecolor='rgba(255,255,255,0.1)', tickfont=dict(size=11)),
        hovermode='x unified',
        hoverlabel=dict(bgcolor='rgba(20,20,30,0.9)', font_size=13, font_family='Inter')
    )

def revenue_chart(df):
    fig = go.Figure()
    for p in ['AWS', 'Azure', 'GCP']:
        fig.add_trace(go.Scatter(
            x=df['Period'], y=df[f'{p}_Revenue_Billion'],
            name=p, mode='lines+markers',
            line=dict(color=COLORS[p], width=3, shape='spline'),
            marker=dict(size=7, symbol='circle'),
            hovertemplate=f'{p}: $%{{y:.1f}}B<extra></extra>'
        ))
    fig.update_layout(**chart_layout('Quarterly Cloud Revenue'))
    fig.update_yaxes(title_text='Revenue ($B)', title_font=dict(size=12))
    return fig

def ai_growth_chart():
    df = pd.read_csv(StringIO(AI_CLOUD_DATA))
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=df['Period'], y=df['Azure_AI_Revenue_B'],
        name='Azure AI', mode='lines+markers',
        line=dict(color='#0078D4', width=3),
        marker=dict(size=8)
    ))
    fig.add_trace(go.Scatter(
        x=df['Period'], y=df['AWS_AI_Revenue_B'],
        name='AWS AI', mode='lines+markers',
        line=dict(color='#FF9900', width=3),
        marker=dict(size=8)
    ))
    fig.add_trace(go.Scatter(
        x=df['Period'], y=df['GCP_AI_Revenue_B'],
        name='GCP AI', mode='lines+markers',
        line=dict(color='#34A853', width=3),
        marker=dict(size=8)
    ))
    fig.update_layout(
        title='AI/ML Cloud Revenue Growth ($B)',
        xaxis_title='Quarter',
        yaxis_title='Revenue ($B)',
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='white'),
        legend=dict(bgcolor='rgba(0,0,0,0)'),
        height=400
    )
    return fig

def cost_shock_calculator(monthly_spend, growth_multiplier, provider):
    months = list(range(1, 13))
    costs = []
    for m in months:
        scale = 1 + (growth_multiplier - 1) * (m / 12)
        cost = monthly_spend * scale
        costs.append(round(cost, 2))
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=months, y=costs,
        mode='lines+markers',
        name=provider,
        line=dict(width=3),
        fill='tozeroy'
    ))
    fig.update_layout(
        title=f'Cost Growth Projection — {provider} ({growth_multiplier}x scale)',
        xaxis_title='Month',
        yaxis_title='Monthly Cost ($)',
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='white'),
        height=350
    )
    return fig, costs[-1]

def tco_comparison_chart(costs):
    fig = go.Figure()
    providers = list(costs.keys())
    values = list(costs.values())
    colors = [COLORS[p] for p in providers]
    
    fig.add_trace(go.Bar(
        x=providers, y=values,
        marker=dict(color=colors, line=dict(width=0)),
        text=[f'${v:,.0f}' for v in values],
        textposition='outside',
        textfont=dict(size=14, color='white', family='Inter'),
        hovertemplate='%{x}: $%{y:,.0f}/month<extra></extra>'
    ))
    
    fig.update_layout(**chart_layout('Monthly Cost Comparison', height=350))
    fig.update_yaxes(title_text='Monthly Cost ($)', title_font=dict(size=12))
    fig.update_xaxes(title_text='')
    return fig

def projection_chart(proj, show_all_scenarios=False):
    fig = go.Figure()
    
    for p in ['AWS', 'Azure', 'GCP']:
        fig.add_trace(go.Scatter(
            x=proj['periods'], y=proj[p],
            name=p, mode='lines+markers',
            line=dict(color=COLORS[p], width=3, shape='spline'),
            marker=dict(size=6),
            hovertemplate=f'{p}: $%{{y:.1f}}B<extra></extra>'
        ))
    
    if proj.get('crossover'):
        crossover_idx = proj['periods'].index(proj['crossover']['q'])
        fig.add_vline(
            x=crossover_idx,
            line_dash='dash',
            line_color='#ef4444',
            line_width=2,
            annotation_text='Crossover',
            annotation_position='top',
            annotation_font_color='#ef4444'
        )
    
    fig.update_layout(**chart_layout('Revenue Projection', height=450))
    fig.update_yaxes(title_text='Revenue ($B)')
    return fig

def run_projection(base, rates, years):
    quarters = years * 4
    proj = {'periods': [], 'AWS': [base['AWS']], 'Azure': [base['Azure']], 'GCP': [base['GCP']]}
    for i in range(quarters + 1):
        proj['periods'].append(f"Q{(i%4)+1} {2026 + i//4}")
    for _ in range(quarters):
        for p in ['AWS', 'Azure', 'GCP']:
            proj[p].append(proj[p][-1] * (1 + rates[p]/4/100))
    
    proj['crossover'] = None
    for i, (a, z) in enumerate(zip(proj['AWS'], proj['Azure'])):
        if z > a:
            proj['crossover'] = {'q': proj['periods'][i], 'v': z}
            break
    return proj

# ============================================================================
# PAGE: HOME
# ============================================================================

def page_home():
    df = load_data()
    latest = df.iloc[-1]
    stocks = get_stocks()

    st.markdown("### 📡 Market Pulse")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Cloud Market Size", "$855B", delta="2026 estimate")
    with col2:
        st.metric("Market CAGR", "19%", delta="through 2029")
    with col3:
        st.metric("AI Cloud Growth", "47% YoY", delta="fastest segment")
    with col4:
        st.metric("Multi-cloud Adoption", "89%", delta="enterprises 2026")
    st.markdown("---")

    # Hero Section
    st.markdown("""
    <div class="hero-section">
        <div class="hero-badge">Enterprise Cloud Intelligence</div>
        <div class="hero-title">The Definitive Cloud Intelligence Platform</div>
        <p class="hero-subtitle">Everything you need to know about AWS, Azure, and Google Cloud — in one place. Built for founders, IT leaders, and anyone making cloud decisions.</p>
        <div class="live-indicator">
            <span class="live-dot"></span>
            Live Market Data
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Animated Stats
    st.markdown(f"""
    <div style="display:flex;justify-content:center;gap:80px;margin-bottom:50px;">
        <div class="animated-stat">
            <div class="stat-value">${latest['Total_Market_Billion']:.0f}B</div>
            <div class="stat-label">Q4 2025 Market Size</div>
        </div>
        <div class="animated-stat">
            <div class="stat-value">3</div>
            <div class="stat-label">Providers Analyzed</div>
        </div>
        <div class="animated-stat">
            <div class="stat-value">{len(df)}</div>
            <div class="stat-label">Quarters of Data</div>
        </div>
        <div class="animated-stat">
            <div class="stat-value">{len(INDUSTRIES)}</div>
            <div class="stat-label">Industries Covered</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Data Freshness
    st.markdown(f"""
    <div style="text-align:center;margin-bottom:40px;">
        <div class="data-freshness">
            <span class="data-freshness-dot"></span>
            Market Data: {DATA_LAST_UPDATED} • Source: {DATA_SOURCE}
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    # Clickable Feature Cards
    st.markdown('<div class="section-header">Platform Capabilities</div>', unsafe_allow_html=True)
    
    c1, c2, c3, c4 = st.columns(4)
    
    with c1:
        st.markdown("""
        <div class="feature-card">
            <span class="feature-icon">🧭</span>
            <div class="feature-title">Cloud Advisor</div>
            <div class="feature-desc">TCO calculator, provider recommendations, and industry analysis unified</div>
            <div class="feature-arrow">→</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Open Cloud Advisor", key="nav_advisor", use_container_width=True):
            st.session_state.current_page = "🧭 Cloud Advisor"
            st.rerun()
    
    with c2:
        st.markdown("""
        <div class="feature-card">
            <span class="feature-icon">🔄</span>
            <div class="feature-title">Migration Analyzer</div>
            <div class="feature-desc">Assess complexity and create a phased migration roadmap</div>
            <div class="feature-arrow">→</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Open Migration Analyzer", key="nav_migration", use_container_width=True):
            st.session_state.current_page = "🔄 Migration Analyzer"
            st.rerun()
    
    with c3:
        st.markdown("""
        <div class="feature-card">
            <span class="feature-icon">📊</span>
            <div class="feature-title">Executive Summary</div>
            <div class="feature-desc">Generate board-ready cloud strategy reports</div>
            <div class="feature-arrow">→</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Open Executive Summary", key="nav_exec", use_container_width=True):
            st.session_state.current_page = "📊 Executive Summary"
            st.rerun()
    
    with c4:
        st.markdown("""
        <div class="feature-card">
            <span class="feature-icon">🔮</span>
            <div class="feature-title">Projection Simulator</div>
            <div class="feature-desc">Model future scenarios and predict market crossovers</div>
            <div class="feature-arrow">→</div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Open Simulator", key="nav_sim", use_container_width=True):
            st.session_state.current_page = "🔮 Simulator"
            st.rerun()
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    # Market Metrics
    st.markdown('<div class="section-header">Market Overview — Q4 2025</div>', unsafe_allow_html=True)
    
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("AWS", f"${latest['AWS_Revenue_Billion']:.1f}B", f"+{latest['AWS_YoY_Growth_Pct']:.0f}% YoY")
    c2.metric("Azure", f"${latest['Azure_Revenue_Billion']:.1f}B", f"+{latest['Azure_YoY_Growth_Pct']:.0f}% YoY")
    c3.metric("GCP", f"${latest['GCP_Revenue_Billion']:.1f}B", f"+{latest['GCP_YoY_Growth_Pct']:.0f}% YoY")
    c4.metric("Total Market", f"${latest['Total_Market_Billion']:.0f}B", "+37% YoY")
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    # Chart and Stocks
    col1, col2 = st.columns([2.5, 1])
    
    with col1:
        st.plotly_chart(revenue_chart(df), use_container_width=True)
        st.markdown("### 🤖 AI/ML Cloud Revenue Growth")
        st.caption("Azure is closing the gap on AWS in AI-specific cloud revenue — the fastest growing segment in cloud today.")
        st.plotly_chart(ai_growth_chart(), use_container_width=True)

    with col2:
        st.markdown('<div class="section-header">Live Stock Prices</div>', unsafe_allow_html=True)
        for provider in ['AWS', 'Azure', 'GCP']:
            s = stocks.get(provider, {})
            change = s.get('change', 0)
            arrow = "▲" if change >= 0 else "▼"
            cls = "stock-up" if change >= 0 else "stock-down"
            st.markdown(f"""
            <div class="stock-card">
                <div class="stock-ticker">{s.get('ticker', 'N/A')} • {provider}</div>
                <div class="stock-price">${s.get('price', 0):,.2f}</div>
                <div class="stock-change {cls}">{arrow} {abs(change):.2f}%</div>
            </div>
            """, unsafe_allow_html=True)
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    # Insights
    st.markdown('<div class="section-header">Strategic Insights</div>', unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("""
        <div class="insight-box">
            <div class="insight-title">🎯 Azure's AI Momentum Accelerates</div>
            <div class="insight-text">Azure's 39% YoY growth in Q4 2025 — its fastest quarter in two years — is driven by exclusive OpenAI integration. Enterprise GPT-4 and Copilot deployments are creating significant platform lock-in.</div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown("""
        <div class="insight-box">
            <div class="insight-title">🚀 GCP Leads Growth at 48% YoY</div>
            <div class="insight-text">Google Cloud's data analytics superiority (BigQuery) and Gemini AI capabilities are winning data-intensive enterprise workloads from both AWS and Azure at an accelerating pace.</div>
        </div>
        """, unsafe_allow_html=True)

# ============================================================================
# PAGE: CLOUD ADVISOR (Recommendation Quiz)
# ============================================================================

def page_cloud_advisor():
    st.markdown("# 🧭 Cloud Advisor")
    st.markdown("*Answer 5 quick questions — get your ideal cloud provider in seconds.*")
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    if 'quiz_step' not in st.session_state:
        st.session_state.quiz_step = 1

    step = st.session_state.quiz_step

    QUESTIONS = [
        "Who are you?",
        "What's your main workload?",
        "Are you already in the Microsoft ecosystem?",
        "What's your monthly cloud budget?",
        "Do you need specific compliance?",
    ]

    if step <= 5:
        st.markdown(f"**Question {step} of 5 — {QUESTIONS[step - 1]}**")
        st.progress(step / 5)
        st.markdown("")

        if step == 1:
            st.session_state.quiz_ans1 = st.radio(
                "Who are you?",
                ["Individual Developer", "Startup (1–50 people)", "Mid-size Business", "Enterprise"],
                key="quiz_q1", label_visibility="collapsed"
            )
        elif step == 2:
            st.session_state.quiz_ans2 = st.radio(
                "What's your main workload?",
                ["Web Apps & APIs", "AI & Machine Learning", "Data Analytics & BI", "Gaming", "File Storage Only"],
                key="quiz_q2", label_visibility="collapsed"
            )
        elif step == 3:
            st.session_state.quiz_ans3 = st.radio(
                "Are you already in the Microsoft ecosystem?",
                ["Yes, we use Office 365 / Teams / Azure AD", "Somewhat", "No, we're independent"],
                key="quiz_q3", label_visibility="collapsed"
            )
        elif step == 4:
            st.session_state.quiz_ans4 = st.radio(
                "What's your monthly cloud budget?",
                ["Under $500", "$500 – $5,000", "$5,000 – $50,000", "$50,000+"],
                key="quiz_q4", label_visibility="collapsed"
            )
        elif step == 5:
            st.session_state.quiz_ans5 = st.radio(
                "Do you need specific compliance?",
                ["None", "HIPAA (Healthcare)", "GDPR (Europe)", "FedRAMP (Government)", "Multiple"],
                key="quiz_q5", label_visibility="collapsed"
            )

        st.markdown("")
        col_back, col_spacer, col_next = st.columns([1, 2, 1])
        with col_back:
            if step > 1:
                if st.button("← Back", use_container_width=True):
                    st.session_state.quiz_step -= 1
                    st.rerun()
        with col_next:
            label = "Get My Recommendation →" if step == 5 else "Next →"
            btn_type = "primary" if step == 5 else "secondary"
            if st.button(label, type=btn_type, use_container_width=True):
                st.session_state.quiz_step += 1
                st.rerun()

    else:
        q1 = st.session_state.get('quiz_ans1', 'Startup (1–50 people)')
        q2 = st.session_state.get('quiz_ans2', 'Web Apps & APIs')
        q3 = st.session_state.get('quiz_ans3', "No, we're independent")
        q4 = st.session_state.get('quiz_ans4', '$500 – $5,000')
        q5 = st.session_state.get('quiz_ans5', 'None')

        # ── Scoring ──────────────────────────────────────────────────────────
        scores = {'AWS': 0, 'Azure': 0, 'GCP': 0}

        if q3 == "Yes, we use Office 365 / Teams / Azure AD":
            scores['Azure'] += 3
        elif q3 == "Somewhat":
            scores['Azure'] += 1

        if q2 == "AI & Machine Learning":
            scores['GCP'] += 2; scores['Azure'] += 1
        elif q2 == "Data Analytics & BI":
            scores['GCP'] += 2; scores['AWS'] += 1
        elif q2 in ("Web Apps & APIs", "Gaming"):
            scores['AWS'] += 2

        if q1 == "Enterprise":
            scores['Azure'] += 2; scores['AWS'] += 1
        elif q1 == "Startup (1–50 people)":
            scores['AWS'] += 2; scores['GCP'] += 1
        elif q1 == "Individual Developer":
            scores['GCP'] += 2

        if q4 == "Under $500":
            scores['GCP'] += 2
        elif q4 == "$50,000+":
            scores['AWS'] += 1; scores['Azure'] += 1

        if q5 == "HIPAA (Healthcare)":
            scores['Azure'] += 2; scores['AWS'] += 1
        elif q5 == "FedRAMP (Government)":
            scores['AWS'] += 3
        elif q5 == "GDPR (Europe)":
            scores['Azure'] += 2; scores['GCP'] += 1
        elif q5 == "Multiple":
            scores['Azure'] += 2; scores['AWS'] += 1

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        winner, winner_score = ranked[0]
        runner_up, _ = ranked[1]

        MAX_SCORE = 10
        confidence = min(95, max(50, int((winner_score / MAX_SCORE) * 100))) if winner_score > 0 else 55

        # ── Dynamic reasoning bullets ─────────────────────────────────────────
        reasons = []

        workload_map = {
            "AI & Machine Learning": {
                'GCP':   "Your AI/ML focus is GCP's strongest suit — Vertex AI and TPU infrastructure lead the industry.",
                'Azure': "Azure OpenAI Service gives you exclusive access to GPT-4 and Copilot for enterprise AI workloads.",
                'AWS':   "AWS SageMaker provides a mature, full-lifecycle ML platform with the broadest tooling ecosystem.",
            },
            "Data Analytics & BI": {
                'GCP':   "BigQuery is the gold standard for serverless analytics — faster and cheaper at petabyte scale.",
                'AWS':   "AWS Redshift and the Athena/Glue ecosystem provide enterprise-grade analytics pipelines.",
                'Azure': "Azure Synapse Analytics integrates natively with Power BI for seamless end-to-end BI.",
            },
            "Web Apps & APIs": {
                'AWS':   "AWS has the deepest web hosting ecosystem — CloudFront, Lambda, and Elastic Beanstalk are battle-tested at massive scale.",
                'Azure': "Azure App Service and API Management make web deployments simple with strong enterprise SLAs.",
                'GCP':   "Cloud Run and Firebase offer a modern serverless stack for web apps with minimal ops overhead.",
            },
            "Gaming": {
                'AWS':   "AWS GameTech (GameLift, GameSparks) powers the majority of global online games today.",
                'Azure': "Azure PlayFab is a dedicated gaming backend platform with live ops, telemetry, and matchmaking built in.",
                'GCP':   "Google Cloud's global network delivers low-latency connections for real-time multiplayer gaming.",
            },
            "File Storage Only": {
                'AWS':   "S3 is the world's most widely used object storage — reliable, cheap, and universally supported by every tool.",
                'Azure': "Azure Blob Storage integrates seamlessly with Microsoft tools and offers strong compliance and tiering.",
                'GCP':   "Google Cloud Storage offers the best price-performance for large-scale and cold storage workloads.",
            },
        }
        reasons.append(workload_map.get(q2, workload_map["Web Apps & APIs"])[winner])

        if q3 == "Yes, we use Office 365 / Teams / Azure AD":
            if winner == "Azure":
                reasons.append("Your existing Microsoft ecosystem (Office 365 / Azure AD) means Azure is a natural extension — single identity, single contract, native integrations out of the box.")
            else:
                reasons.append(f"Even with Microsoft tools in use, {winner} connects cleanly via SSO and API connectors, so you keep your existing workflows without friction.")
        elif q3 == "Somewhat" and winner == "Azure":
            reasons.append("Partial Microsoft adoption is a natural on-ramp to Azure — you can deepen integration at your own pace without a hard cutover.")

        compliance_map = {
            "HIPAA (Healthcare)": {
                'Azure': "Azure has the most comprehensive HIPAA/HITECH coverage with pre-signed BAAs and Microsoft Cloud for Healthcare purpose-built for the industry.",
                'AWS':   "AWS offers HIPAA-eligible services across 100+ products and has been the healthcare cloud of choice for years.",
                'GCP':   "Google Cloud supports HIPAA workloads with strong encryption, audit logging, and a signed BAA.",
            },
            "FedRAMP (Government)": {
                'AWS':   "FedRAMP High is your critical requirement — AWS GovCloud leads with the broadest FedRAMP High and DoD IL5 authorization of any provider.",
                'Azure': "Azure Government holds the widest set of US government compliance certifications including FedRAMP High, ITAR, and CJIS.",
                'GCP':   "Google Cloud's Assured Workloads and FedRAMP Moderate authorization cover most government use cases.",
            },
            "GDPR (Europe)": {
                'Azure': "Azure leads on GDPR with 90+ compliance certifications, EU data residency guarantees, and established European legal infrastructure.",
                'GCP':   "Google Cloud offers strong GDPR tooling including data residency controls and transparent data processing agreements.",
                'AWS':   "AWS provides GDPR-compliant EU regions with comprehensive data processing agreements and detailed compliance docs.",
            },
        }
        if q5 in compliance_map:
            reasons.append(compliance_map[q5][winner])

        if len(reasons) < 3:
            size_map = {
                "Individual Developer": {
                    'GCP':   "GCP's free tier is the most generous for solo developers — $300 credit plus always-free BigQuery and Cloud Run.",
                    'AWS':   "AWS Free Tier covers 12 months of core services — the best starting point for learning and building solo.",
                    'Azure': "Azure gives $200 credit plus 55+ always-free services, with excellent learning resources for individuals.",
                },
                "Startup (1–50 people)": {
                    'AWS':   "AWS Activate offers startups up to $100k in credits, and the ecosystem makes hiring engineers easier than any other platform.",
                    'GCP':   "Google for Startups provides up to $200k in credits plus direct access to Google's ML infrastructure from day one.",
                    'Azure': "Microsoft for Startups includes $150k in Azure credits plus free GitHub and Microsoft 365 — a strong all-in package.",
                },
                "Enterprise": {
                    'Azure': "Enterprises with existing Microsoft EAs can roll Azure costs into their existing agreement, consolidating spend and simplifying procurement.",
                    'AWS':   "AWS Enterprise Discount Program (EDP) offers the best long-term economics at scale with dedicated support and custom pricing.",
                    'GCP':   "Google Cloud's committed use contracts offer predictable pricing for large enterprise workloads with strong negotiated discounts.",
                },
                "Mid-size Business": {
                    'AWS':   "AWS's breadth of managed services lets mid-size teams move fast without maintaining infrastructure — pay only for what you use.",
                    'Azure': "Azure hybrid benefit and dev/test pricing offer mid-size businesses significant savings on Windows and SQL Server workloads.",
                    'GCP':   "GCP's sustained use discounts apply automatically with no commitment required — ideal for predictable mid-size workloads.",
                },
            }
            reasons.append(size_map.get(q1, size_map["Mid-size Business"])[winner])

        reasons = reasons[:3]

        runner_notes = {
            ('AWS', 'Azure'): "Azure is a strong second if your Microsoft footprint grows or compliance needs increase.",
            ('AWS', 'GCP'):   "GCP is worth a close look if AI/ML becomes a bigger priority down the road.",
            ('Azure', 'AWS'): "AWS offers the widest service breadth if you ever need to operate outside the Microsoft ecosystem.",
            ('Azure', 'GCP'): "GCP's AI tools and analytics are compelling if data workloads become your core differentiator.",
            ('GCP', 'AWS'):   "AWS has unmatched ecosystem depth and is the safe default if your workloads diversify.",
            ('GCP', 'Azure'): "Azure is the natural fallback if you move into the Microsoft ecosystem or need deep compliance coverage.",
        }
        runner_note = runner_notes.get((winner, runner_up), f"{runner_up} is a solid alternative worth evaluating.")

        # ── Render results ────────────────────────────────────────────────────
        st.markdown("### Your Result")
        st.markdown(f"""
        <div class="card" style="border-left:6px solid {COLORS[winner]};padding:40px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px;">
                <div>
                    <div style="font-size:0.8rem;color:#888;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:10px;">Recommended Provider</div>
                    <div style="font-size:3.5rem;font-weight:800;color:{COLORS[winner]};line-height:1;">{winner}</div>
                    <div style="font-size:1rem;color:#aaa;margin-top:8px;">{q2} · {q1}</div>
                </div>
                <div class="confidence-display">
                    <div class="confidence-circle" style="--conf-color:{COLORS[winner]};--conf-percent:{confidence};">
                        <div class="confidence-inner">
                            <div class="confidence-value">{confidence}%</div>
                            <div class="confidence-label">Match</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
        st.markdown("**Why this fits you:**")
        for reason in reasons:
            st.markdown(f"""
            <div class="insight-box" style="margin-bottom:12px;">
                <div class="insight-text">✦ {reason}</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
        st.markdown(f"""
        <div class="card" style="padding:24px;">
            <div style="font-size:0.75rem;color:#666;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Also Consider</div>
            <div style="display:flex;align-items:center;gap:16px;">
                <div style="font-size:1.6rem;font-weight:700;color:{COLORS[runner_up]};">{runner_up}</div>
                <div style="color:#aaa;font-size:0.95rem;">{runner_note}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("")
        if st.button("← Start Over"):
            for key in ['quiz_step', 'quiz_ans1', 'quiz_ans2', 'quiz_ans3', 'quiz_ans4', 'quiz_ans5']:
                st.session_state.pop(key, None)
            st.rerun()

# ============================================================================
# PAGE: MIGRATION ANALYZER
# ============================================================================

def page_migration():
    st.markdown("# 🔄 Migration Analyzer")
    st.markdown("*Assess migration complexity and create a phased roadmap*")
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        current = st.selectbox(
            "Current Infrastructure",
            ['On-Premises', 'AWS', 'Azure', 'GCP', 'Other Cloud', 'Colocation'],
            help="Where your workloads currently run"
        )
        st.markdown('<p class="tooltip-text">On-premises migrations typically have higher complexity</p>', unsafe_allow_html=True)
        
        target = st.selectbox(
            "Target Cloud",
            ['AWS', 'Azure', 'GCP'],
            help="Where you want to migrate your workloads"
        )
        st.markdown('<p class="tooltip-text">Each provider has different migration tools and approaches</p>', unsafe_allow_html=True)
        
        data_size = st.slider(
            "Total Data Size (TB)",
            min_value=1, max_value=500, value=50,
            help="Total data volume to migrate including databases and files"
        )
        st.markdown('<p class="tooltip-text">Larger datasets require more careful planning and longer timelines</p>', unsafe_allow_html=True)
    
    with col2:
        workloads = st.multiselect(
            "Workload Types",
            ['Web Applications', 'Databases', 'Legacy Applications', 'Containers',
             'Big Data', 'Machine Learning', 'Mainframe', 'Custom Databases'],
            default=['Web Applications', 'Databases'],
            help="Types of workloads included in migration"
        )
        st.markdown('<p class="tooltip-text">Legacy applications and mainframes increase complexity significantly</p>', unsafe_allow_html=True)
        
        integrations = st.slider(
            "Third-Party Integrations",
            min_value=0, max_value=50, value=10,
            help="Number of external systems connected to your infrastructure"
        )
        st.markdown('<p class="tooltip-text">Each integration needs to be tested during migration</p>', unsafe_allow_html=True)
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    if st.button("Analyze Migration Complexity", type="primary", use_container_width=True):
        score = calculate_migration_complexity(current, workloads, data_size, integrations)
        
        if score < 40:
            level = 'Easy'
            gauge_class = 'gauge-easy'
            timeline = '3-6 months'
            desc = 'Relatively straightforward migration with standard lift-and-shift approach.'
        elif score < 70:
            level = 'Medium'
            gauge_class = 'gauge-medium'
            timeline = '6-12 months'
            desc = 'Moderate complexity requiring careful planning and phased execution.'
        else:
            level = 'Hard'
            gauge_class = 'gauge-hard'
            timeline = '12-24 months'
            desc = 'Complex migration requiring extensive planning, refactoring, and specialized expertise.'
        
        st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
        
        # Visual Gauge
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.markdown(f"""
            <div class="gauge-container">
                <div class="gauge-circle {gauge_class}" style="--gauge-percent: {score};">
                    <div class="gauge-inner">
                        <div class="gauge-value">{score}</div>
                        <div class="gauge-label">{level}</div>
                    </div>
                </div>
                <p style="text-align:center;color:#888;margin-top:20px;font-size:0.95rem;">{desc}</p>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("### Migration Summary")
            
            c1, c2, c3 = st.columns(3)
            c1.metric("Estimated Timeline", timeline)
            c2.metric("Data Volume", f"{data_size} TB")
            c3.metric("Workload Types", len(workloads))
            
            # Risk breakdown
            st.markdown("**Complexity Contributors:**")
            
            factors = []
            if current == 'On-Premises':
                factors.append(("On-premises source", "+35 points", "#ef4444"))
            elif current == 'Colocation':
                factors.append(("Colocation source", "+30 points", "#eab308"))
            
            legacy_count = len([w for w in workloads if w in ['Legacy Applications', 'Mainframe', 'Custom Databases']])
            if legacy_count > 0:
                factors.append((f"Legacy workloads ({legacy_count})", f"+{legacy_count * 12} points", "#ef4444"))
            
            if data_size > 100:
                factors.append(("Large data volume (>100TB)", "+20 points", "#eab308"))
            elif data_size > 50:
                factors.append(("Medium data volume (>50TB)", "+12 points", "#eab308"))
            
            if integrations > 15:
                factors.append((f"Many integrations ({integrations})", f"+{min(int(integrations * 2.5), 25)} points", "#eab308"))
            
            for factor, points, color in factors:
                st.markdown(f'<span style="color:{color};">●</span> {factor}: <span style="color:{color};">{points}</span>', unsafe_allow_html=True)
        
        st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
        
        # Timeline Visualization
        st.markdown("### Recommended Migration Phases")
        
        phases = [
            ("Assessment & Discovery", "2-4 weeks", "Document current state, map dependencies, identify risks, create detailed inventory"),
            ("Foundation Setup", "3-4 weeks", f"Establish {target} landing zone, configure networking, security, and IAM policies"),
            ("Pilot Migration", "4-6 weeks", "Migrate 2-3 non-critical workloads to validate approach and build team expertise"),
            ("Production Waves", f"{'8-12' if score < 50 else '12-20'} weeks", "Execute production migrations in prioritized waves with rollback plans"),
            ("Optimization & Handoff", "Ongoing", "Right-size resources, implement FinOps practices, complete knowledge transfer")
        ]
        
        st.markdown('<div class="timeline">', unsafe_allow_html=True)
        for phase, duration, desc in phases:
            st.markdown(f"""
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-phase">{phase}</div>
                    <div class="timeline-duration">⏱️ {duration}</div>
                    <div class="timeline-desc">{desc}</div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    st.markdown("### 🗺️ Migration Path Detail")

    migration_paths = {
        ("AWS", "Azure"): {
            "hardest": ["IAM roles → Azure AD migration", "S3 → Azure Blob Storage data transfer costs", "Lambda → Azure Functions rewrite"],
            "easiest": ["EC2 → Azure VMs (near identical)", "RDS → Azure SQL Database"],
            "time": "3-6 months typical"
        },
        ("AWS", "GCP"): {
            "hardest": ["IAM → GCP IAM restructure", "CloudFormation → Terraform/Deployment Manager rewrite", "VPC networking differences"],
            "easiest": ["S3 → Cloud Storage (simple)", "BigQuery is superior to Redshift for analytics"],
            "time": "4-8 months typical"
        },
        ("Azure", "AWS"): {
            "hardest": ["Azure AD → AWS IAM/Cognito", "Azure DevOps pipelines → CodePipeline rewrite", "ARM templates → CloudFormation"],
            "easiest": ["Azure VMs → EC2 (straightforward)", "Blob Storage → S3 (easy mapping)"],
            "time": "3-5 months typical"
        },
        ("Azure", "GCP"): {
            "hardest": ["Azure AD → Google Workspace/Cloud Identity", "Cost management tooling differences", "Azure-specific compliance tools"],
            "easiest": ["AI/ML workloads improve on GCP", "BigQuery vs Azure Synapse — GCP wins"],
            "time": "4-7 months typical"
        },
        ("GCP", "AWS"): {
            "hardest": ["Deployment Manager → CloudFormation", "GKE → EKS differences", "BigQuery → Redshift performance gap"],
            "easiest": ["Compute Engine → EC2 (simple)", "Cloud Storage → S3 (easy)"],
            "time": "3-5 months typical"
        },
        ("GCP", "Azure"): {
            "hardest": ["Google Workspace → Microsoft 365 integration", "GCP IAM → Azure AD", "Anthos → Azure Arc differences"],
            "easiest": ["AI workloads stay strong on Azure OpenAI", "Enterprise compliance tools better on Azure"],
            "time": "4-6 months typical"
        }
    }

    col1, col2 = st.columns(2)
    with col1:
        from_provider = st.selectbox("Migrating FROM", ["AWS", "Azure", "GCP"], key="mig_from")
    with col2:
        to_options = [p for p in ["AWS", "Azure", "GCP"] if p != from_provider]
        to_provider = st.selectbox("Migrating TO", to_options, key="mig_to")

    path = migration_paths.get((from_provider, to_provider))
    if path:
        st.markdown(f"**Estimated timeline: {path['time']}**")
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("**⚠️ Hardest Parts:**")
            for item in path['hardest']:
                st.markdown(f"- {item}")
        with col2:
            st.markdown("**✅ Easiest Parts:**")
            for item in path['easiest']:
                st.markdown(f"- {item}")

# ============================================================================
# PAGE: EXECUTIVE SUMMARY
# ============================================================================

def page_executive_summary():
    st.markdown("# 📊 Executive Summary")
    st.markdown("*Generate a professional, board-ready cloud strategy document*")
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        company = st.text_input("Company Name", "Acme Corporation", help="Your organization's name for the report header")
        industry = st.selectbox("Industry", list(INDUSTRIES.keys()), help="Primary industry for compliance and recommendation context")
    with col2:
        prepared_by = st.text_input("Prepared By", "Cloud Strategy Team", help="Author or team name for attribution")
        report_date = datetime.now().strftime('%B %d, %Y')
        st.text_input("Report Date", report_date, disabled=True)
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    if st.button("Generate Executive Summary", type="primary", use_container_width=True):
        df = load_data()
        latest = df.iloc[-1]
        ind = INDUSTRIES[industry]
        rec = ind['rec']
        
        # Build the executive summary document
        st.markdown(f"""
        <div class="exec-document">
            <div class="exec-header">
                <div>
                    <div class="exec-logo">☁️ Cloud Strategy Assessment</div>
                    <div style="color:#888;font-size:0.9rem;margin-top:4px;">Confidential</div>
                </div>
                <div class="exec-meta">
                    <div><strong>Date:</strong> {report_date}</div>
                    <div><strong>Prepared by:</strong> {prepared_by}</div>
                    <div><strong>Version:</strong> 1.0</div>
                </div>
            </div>
            
            <div class="exec-title">Cloud Strategy Assessment</div>
            <div class="exec-subtitle">Prepared for {company} | Industry: {industry}</div>
            
            <div class="exec-section">
                <div class="exec-section-title">📋 Executive Overview</div>
                <div class="exec-section-content">
                    This assessment provides a strategic analysis of cloud provider options for {company}, 
                    a {industry} organization. Based on industry requirements, compliance needs, and market dynamics, 
                    we have developed a clear recommendation to guide your cloud strategy.
                </div>
            </div>
            
            <div class="exec-highlight">
                <div class="exec-section-title" style="margin-bottom:12px;">✅ Strategic Recommendation</div>
                <div class="exec-section-content">
                    We recommend <strong style="color:{COLORS[rec]};">{rec}</strong> as the primary cloud provider for {company} 
                    with a confidence score of <strong>{ind['conf']}%</strong>.
                </div>
            </div>
            
            <div class="exec-section">
                <div class="exec-section-title">📈 Market Context (Q4 2025)</div>
                <div class="exec-metrics">
                    <div class="exec-metric">
                        <div class="exec-metric-value" style="color:#ff9900;">${latest['AWS_Revenue_Billion']:.1f}B</div>
                        <div class="exec-metric-label">AWS Revenue</div>
                    </div>
                    <div class="exec-metric">
                        <div class="exec-metric-value" style="color:#0078d4;">${latest['Azure_Revenue_Billion']:.1f}B</div>
                        <div class="exec-metric-label">Azure Revenue</div>
                    </div>
                    <div class="exec-metric">
                        <div class="exec-metric-value" style="color:#34a853;">${latest['GCP_Revenue_Billion']:.1f}B</div>
                        <div class="exec-metric-label">GCP Revenue</div>
                    </div>
                </div>
                <div class="exec-section-content" style="margin-top:16px;">
                    The global cloud infrastructure market reached <strong>${latest['Total_Market_Billion']:.0f}B</strong> in Q4 2025, 
                    representing continued strong growth. AWS maintains market leadership at {latest['AWS_Share_Pct']}% share, 
                    while Azure ({latest['Azure_Share_Pct']}%) and GCP ({latest['GCP_Share_Pct']}%) continue gaining ground.
                </div>
            </div>
            
            <div class="exec-section">
                <div class="exec-section-title">🎯 Rationale</div>
                <div class="exec-section-content">{ind['reason']}</div>
            </div>
            
            <div class="exec-section">
                <div class="exec-section-title">🔒 Compliance Requirements</div>
                <div class="exec-section-content">
                    For {industry} organizations, the following compliance frameworks are critical: 
                    <strong>{', '.join(ind['compliance'])}</strong>. Our recommended provider has demonstrated 
                    strong compliance coverage across these requirements.
                </div>
            </div>
            
            <div class="exec-section">
                <div class="exec-section-title">📝 Recommended Next Steps</div>
                <div class="exec-section-content">
                    <ol style="margin:0;padding-left:24px;line-height:2;">
                        <li>Schedule discovery workshop with {rec} solutions architect</li>
                        <li>Complete detailed workload assessment and total cost of ownership analysis</li>
                        <li>Develop migration roadmap with prioritized workloads and timelines</li>
                        <li>Establish governance framework, security baseline, and FinOps practices</li>
                        <li>Execute pilot project to validate approach before full migration</li>
                    </ol>
                </div>
            </div>
            
            <div class="exec-section">
                <div class="exec-section-title">⚠️ Key Considerations</div>
                <div class="exec-section-content">
                    <ul style="margin:0;padding-left:24px;line-height:2;">
                        <li>This assessment is based on current market data as of {DATA_LAST_UPDATED}</li>
                        <li>Actual costs will vary based on specific workload requirements and usage patterns</li>
                        <li>Compliance requirements should be validated with legal and compliance teams</li>
                        <li>Multi-cloud strategies may be appropriate for specific use cases</li>
                    </ul>
                </div>
            </div>
            
            <div class="exec-footer">
                <div>Generated by Cloud Intelligence Platform v7.0</div>
                <div>Data Source: {DATA_SOURCE}</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
        
        st.info("💡 **Print to PDF:** Use your browser's print function (Ctrl/Cmd + P) and select 'Save as PDF' for a professional document.")

        def generate_text_report(company, industry, ind, report_date):
            report = f"""CLOUD INTELLIGENCE PLATFORM
Executive Summary Report
Generated: {report_date}
{"="*50}

COMPANY: {company}
INDUSTRY: {industry}
RECOMMENDED PROVIDER: {ind['rec']}
CONFIDENCE SCORE: {ind['conf']}%

KEY RATIONALE:
{ind['reason']}

COMPLIANCE REQUIREMENTS: {', '.join(ind['compliance'])}

MARKET CONTEXT:
- Global cloud market size: $855B (2026)
- Market CAGR: 19% through 2029
- AI cloud growth: 47% YoY
- Multi-cloud adoption: 89% of enterprises

TOP 3 PROVIDERS:
1. AWS   — Market leader, 30% share, strongest service breadth
2. Azure — Fastest enterprise growth, 23% share
3. GCP   — AI/ML leader, 12% share

RECOMMENDATION RATIONALE:
Based on your industry profile, compliance requirements,
and workload patterns, the analysis points to {ind['rec']}
as the optimal fit for {company}.

{"="*50}
Built by Yasaswi Dutta | Cloud Intelligence Platform
Data sourced from SEC filings and earnings reports
"""
            return report.encode('utf-8')

        report_bytes = generate_text_report(company, industry, ind, report_date)
        st.download_button(
            label="⬇️ Download Report (.txt)",
            data=report_bytes,
            file_name=f"cloud_intelligence_report_{datetime.now().strftime('%Y%m%d')}.txt",
            mime="text/plain"
        )

# ============================================================================
# PAGE: PROJECTION SIMULATOR
# ============================================================================

def page_simulator():
    st.markdown("# 🔮 Projection Simulator")
    st.markdown("*Model future scenarios and predict market dynamics*")
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    df = load_data()
    latest = df.iloc[-1]
    
    # Scenario presets
    st.markdown('<div class="section-header">Scenario Presets</div>', unsafe_allow_html=True)
    
    c1, c2, c3 = st.columns(3)
    
    if 'sim_rates' not in st.session_state:
        st.session_state.sim_rates = {'AWS': 18.0, 'Azure': 27.0, 'GCP': 35.0}
    
    with c1:
        if st.button("🐂 Bull Case", use_container_width=True, help="Optimistic growth scenario"):
            st.session_state.sim_rates = {'AWS': 22.0, 'Azure': 35.0, 'GCP': 45.0}
            st.rerun()
    with c2:
        if st.button("📊 Base Case", use_container_width=True, help="Expected growth based on trends"):
            st.session_state.sim_rates = {'AWS': 18.0, 'Azure': 27.0, 'GCP': 35.0}
            st.rerun()
    with c3:
        if st.button("🐻 Bear Case", use_container_width=True, help="Conservative growth scenario"):
            st.session_state.sim_rates = {'AWS': 12.0, 'Azure': 18.0, 'GCP': 22.0}
            st.rerun()
    
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.markdown("### Growth Parameters")
        
        aws_r = st.slider("AWS Annual Growth (%)", 5.0, 35.0, st.session_state.sim_rates['AWS'], 
                         help="Projected year-over-year growth rate for AWS")
        azure_r = st.slider("Azure Annual Growth (%)", 5.0, 50.0, st.session_state.sim_rates['Azure'],
                           help="Projected year-over-year growth rate for Azure")
        gcp_r = st.slider("GCP Annual Growth (%)", 5.0, 60.0, st.session_state.sim_rates['GCP'],
                         help="Projected year-over-year growth rate for GCP")
        years = st.slider("Projection Period (Years)", 1, 10, 5,
                         help="How far into the future to project")
        
        st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
        
        st.markdown("### Assumptions")
        st.markdown("""
        <div style="font-size:0.85rem;color:#888;line-height:1.7;">
        • Growth rates applied quarterly<br>
        • No major market disruptions<br>
        • Current competitive dynamics persist<br>
        • Based on Q4 2025 baseline
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        base = {
            'AWS': latest['AWS_Revenue_Billion'],
            'Azure': latest['Azure_Revenue_Billion'],
            'GCP': latest['GCP_Revenue_Billion']
        }
        rates = {'AWS': aws_r, 'Azure': azure_r, 'GCP': gcp_r}
        proj = run_projection(base, rates, years)
        
        st.plotly_chart(projection_chart(proj), use_container_width=True)
        
        # End state metrics
        c1, c2, c3 = st.columns(3)
        c1.metric(f"AWS ({years}yr)", f"${proj['AWS'][-1]:.1f}B", f"+{((proj['AWS'][-1]/proj['AWS'][0])-1)*100:.0f}%")
        c2.metric(f"Azure ({years}yr)", f"${proj['Azure'][-1]:.1f}B", f"+{((proj['Azure'][-1]/proj['Azure'][0])-1)*100:.0f}%")
        c3.metric(f"GCP ({years}yr)", f"${proj['GCP'][-1]:.1f}B", f"+{((proj['GCP'][-1]/proj['GCP'][0])-1)*100:.0f}%")
        
        # Crossover insight
        if proj['crossover']:
            crossover_q = str(proj['crossover']['q'])
            st.success(f"🚨 **Crossover Alert:** Based on current growth rates, Azure is projected to overtake AWS in **{crossover_q}**. This is the moment the cloud industry has been watching.")
        else:
            st.info("📊 **No crossover detected** in this scenario's projection window. AWS maintains lead throughout.")

        st.markdown("---")
        st.caption("Adjust the growth rate sliders above to see how the crossover point shifts across scenarios.")

# ============================================================================
# PAGE: INTELLIGENCE FEED
# ============================================================================

def page_intelligence():
    st.markdown("## 📰 Cloud Intelligence Feed")
    st.caption("Live news and analysis from across the cloud industry.")

    with st.spinner("Fetching latest cloud news..."):
        live_articles, fetch_error = fetch_live_news()

    if live_articles:
        st.success("✅ Live feed active")
        articles = live_articles
    else:
        if fetch_error:
            st.warning(f"⚠️ Live feed unavailable: {fetch_error}")
        else:
            st.warning("⚠️ Live feed unavailable — showing curated headlines.")
        articles = [
            {'date': 'Apr 18, 2026', 'provider': 'Azure', 'title': 'Microsoft announces GPT-5 exclusive integration in Azure OpenAI Service', 'impact': 'High', 'url': ''},
            {'date': 'Apr 15, 2026', 'provider': 'AWS', 'title': 'AWS reduces S3 storage pricing by 15% across all regions', 'impact': 'Medium', 'url': ''},
            {'date': 'Apr 12, 2026', 'provider': 'GCP', 'title': 'Google Cloud launches Gemini 2.0 on Vertex AI platform', 'impact': 'High', 'url': ''},
            {'date': 'Apr 10, 2026', 'provider': 'AWS', 'title': 'Amazon announces new AWS region in Saudi Arabia', 'impact': 'Medium', 'url': ''},
            {'date': 'Apr 8, 2026', 'provider': 'Azure', 'title': 'Azure Stack HCI receives major performance and security updates', 'impact': 'Low', 'url': ''},
            {'date': 'Apr 5, 2026', 'provider': 'GCP', 'title': 'BigQuery adds real-time streaming analytics with sub-second latency', 'impact': 'Medium', 'url': ''},
            {'date': 'Apr 3, 2026', 'provider': 'AWS', 'title': 'AWS Lambda increases memory limits to 20GB for compute-intensive workloads', 'impact': 'Medium', 'url': ''},
            {'date': 'Apr 1, 2026', 'provider': 'Azure', 'title': 'Microsoft acquires leading Kubernetes security startup', 'impact': 'High', 'url': ''},
        ]

    provider_filter = st.multiselect("Filter by Provider", ["AWS", "Azure", "GCP"], default=["AWS", "Azure", "GCP"])
    impact_filter = st.multiselect("Filter by Impact", ["High", "Medium", "Low"], default=["High", "Medium", "Low"])

    filtered = [a for a in articles if a['provider'] in provider_filter and a['impact'] in impact_filter]

    impact_colors = {'High': '#ef4444', 'Medium': '#f59e0b', 'Low': '#22c55e'}
    provider_colors = {'AWS': '#FF9900', 'Azure': '#0078D4', 'GCP': '#34A853'}

    for article in filtered:
        impact_color = impact_colors.get(article['impact'], '#888')
        provider_color = provider_colors.get(article['provider'], '#888')
        link_html = f'<a href="{article["url"]}" target="_blank" style="color:#888;font-size:12px;">Read more →</a>' if article.get('url') else ''
        st.markdown(f"""
        <div style="border-left: 4px solid {provider_color}; padding: 12px 16px; margin: 8px 0; background: rgba(255,255,255,0.03); border-radius: 4px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span style="color:{provider_color}; font-weight:600; font-size:13px;">{article['provider']}</span>
                <span style="color:{impact_color}; font-size:12px; font-weight:600;">{article['impact']} Impact</span>
            </div>
            <div style="font-size:15px; margin-bottom:4px;">{article['title']}</div>
            <div style="color:#888; font-size:12px;">{article['date']} {link_html}</div>
        </div>
        """, unsafe_allow_html=True)

    if not filtered:
        st.info("No articles match your current filters.")

# ============================================================================
# PAGE: COST SHOCK CALCULATOR
# ============================================================================

def page_cost_shock():
    st.markdown("# 💸 Cost Shock Calculator")
    st.markdown("*See how your cloud bill scales as your company grows — month by month.*")
    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    col1, col2 = st.columns([1, 2])

    with col1:
        st.markdown("### Inputs")

        monthly_spend = st.number_input(
            "Current Monthly Spend ($)",
            min_value=100, max_value=10_000_000, value=10_000, step=500,
            help="Your current total cloud bill per month"
        )

        st.markdown("**Growth Scenario**")
        preset_col1, preset_col2, preset_col3 = st.columns(3)
        if 'shock_multiplier' not in st.session_state:
            st.session_state.shock_multiplier = 3.0
        with preset_col1:
            if st.button("2x\nSteady", use_container_width=True):
                st.session_state.shock_multiplier = 2.0
                st.rerun()
        with preset_col2:
            if st.button("5x\nHyper", use_container_width=True):
                st.session_state.shock_multiplier = 5.0
                st.rerun()
        with preset_col3:
            if st.button("10x\nBlitz", use_container_width=True):
                st.session_state.shock_multiplier = 10.0
                st.rerun()

        growth_multiplier = st.slider(
            "End-of-Year Scale Factor",
            min_value=1.1, max_value=20.0,
            value=st.session_state.shock_multiplier,
            step=0.1,
            help="How many times larger your infrastructure will be by month 12"
        )
        st.session_state.shock_multiplier = growth_multiplier

        provider = st.selectbox(
            "Cloud Provider",
            ["AWS", "Azure", "GCP"],
            help="Provider whose branding and color to use in the chart"
        )

        st.markdown('<div class="divider"></div>', unsafe_allow_html=True)
        st.markdown("""
        <div style="font-size:0.82rem;color:#666;line-height:1.7;">
        • Scale factor applies linearly over 12 months<br>
        • Month 1 ≈ current spend<br>
        • Month 12 = spend × scale factor<br>
        • Does not account for reserved pricing
        </div>
        """, unsafe_allow_html=True)

    with col2:
        fig, projected_month12 = cost_shock_calculator(monthly_spend, growth_multiplier, provider)

        annual_total = sum(
            round(monthly_spend * (1 + (growth_multiplier - 1) * (m / 12)), 2)
            for m in range(1, 13)
        )
        absolute_increase = projected_month12 - monthly_spend

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Current Monthly", f"${monthly_spend:,.0f}")
        m2.metric("Month 12 Projected", f"${projected_month12:,.0f}",
                  f"+${absolute_increase:,.0f}")
        m3.metric("Total Annual Cost", f"${annual_total:,.0f}")
        m4.metric("Growth Factor", f"{growth_multiplier:.1f}x")

        st.plotly_chart(fig, use_container_width=True)

        if growth_multiplier >= 8:
            level, color, advice = "Extreme", "#ef4444", "At this scale velocity, architecture and contract renegotiation should begin immediately. Reserved pricing and enterprise agreements become critical."
        elif growth_multiplier >= 4:
            level, color, advice = "High", "#eab308", "Significant spend increase ahead. Evaluate reserved instances and savings plans now to lock in discounts before costs compound."
        elif growth_multiplier >= 2:
            level, color, advice = "Moderate", "#6366f1", "Manageable growth trajectory. Review your auto-scaling policies and rightsizing opportunities to keep efficiency high."
        else:
            level, color, advice = "Low", "#22c55e", "Stable growth. Good time to audit existing spend for waste and negotiate better rates with your provider."

        st.markdown(f"""
        <div class="insight-box" style="background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03)); border-color: rgba(99,102,241,0.2); margin-top: 16px;">
            <div class="insight-title" style="color:{color};">⚡ {level} Growth Alert</div>
            <div class="insight-text">{advice}</div>
        </div>
        """, unsafe_allow_html=True)

# ============================================================================
# MAIN
# ============================================================================

def main():
    # Sidebar
    st.sidebar.markdown("""
    <div style="text-align:center;padding:24px 0;">
        <div style="font-size:2.5rem;margin-bottom:12px;">☁️</div>
        <div style="font-size:1.2rem;font-weight:700;color:white;letter-spacing:-0.02em;">Cloud Intelligence</div>
        <div style="font-size:0.75rem;color:#666;margin-top:4px;">Platform v7.0</div>
    </div>
    """, unsafe_allow_html=True)
    
    st.sidebar.markdown("---")
    
    pages = [
        "🏠 Home",
        "🧭 Cloud Advisor",
        "🔄 Migration Analyzer",
        "📊 Executive Summary",
        "🔮 Simulator",
        "📰 Intelligence Feed",
        "💸 Cost Shock"
    ]
    
    # Use session state for page if set by navigation buttons
    current = st.session_state.get('current_page', "🏠 Home")
    if current not in pages:
        current = "🏠 Home"
    
    page = st.sidebar.radio(
        "Navigation",
        pages,
        index=pages.index(current),
        key="nav_radio"
    )
    
    # Update session state
    st.session_state.current_page = page
    
    st.sidebar.markdown("---")
    st.sidebar.caption(f"📊 Data: {DATA_LAST_UPDATED}")
    st.sidebar.caption("Built by Yasaswi Dutta")
    
    # Route to pages
    page_functions = {
        "🏠 Home": page_home,
        "🧭 Cloud Advisor": page_cloud_advisor,
        "🔄 Migration Analyzer": page_migration,
        "📊 Executive Summary": page_executive_summary,
        "🔮 Simulator": page_simulator,
        "📰 Intelligence Feed": page_intelligence,
        "💸 Cost Shock": page_cost_shock
    }
    
    page_functions[page]()

if __name__ == "__main__":
    main()
