# Cloud Intelligence Platform - Web Application

## Quick Start

### 1. Install Dependencies

```bash
cd 06_web_application
pip install -r requirements.txt
```

### 2. Run the Application

```bash
streamlit run app.py
```

### 3. Open in Browser

The app will automatically open at `http://localhost:8501`

---

## Features

### 📊 Dashboard
- Current market snapshot (Q4 2025)
- Revenue metrics for AWS, Azure, GCP
- Market share pie chart
- Key insights summary

### 📈 Trends
- Interactive revenue trend charts
- Market share evolution
- Growth rate comparison
- AWS-Azure gap analysis

### 🔮 Projections
- Adjustable growth rate sliders
- What-if scenario modeling
- Crossover point calculation
- Visual projection charts

### 📋 Data Explorer
- Browse raw quarterly data
- Browse annual summaries
- Download CSV exports

---

## Deployment Options

### Option 1: Streamlit Cloud (Free)

1. Push code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect your repo
4. Deploy

### Option 2: Heroku

1. Add `Procfile`:
```
web: streamlit run app.py --server.port $PORT
```

2. Deploy:
```bash
heroku create your-app-name
git push heroku main
```

### Option 3: Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8501
CMD ["streamlit", "run", "app.py"]
```

---

## File Structure

```
06_web_application/
├── app.py              # Main Streamlit application
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

---

## Customization

### Adding New Charts

Edit `app.py` and add new visualization functions following the pattern:

```python
def plot_new_chart(df):
    fig = go.Figure()
    # Add traces
    fig.update_layout(title='New Chart')
    return fig
```

### Adding New Pages

Add to the sidebar navigation:

```python
page = st.sidebar.radio(
    "Select Page",
    ["📊 Dashboard", "📈 Trends", "🔮 Projections", "📋 Data Explorer", "🆕 New Page"]
)
```

Then add the page logic in the main function.

---

## Data Source

The application reads from:
```
../02_data/processed/cloud_market_master.csv
```

Ensure this file exists with the expected columns.

---

*Last Updated: April 2026*
