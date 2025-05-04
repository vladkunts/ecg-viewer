# ECG Viewer

Single-page React application for ECG data visualization and annotation editing.

Built using **React**, **Vite**, **D3.js**, this app was implemented as part of a frontend test assignment for a medical technologies company.

---

## 📊 Functionality

### ✅ Core features (as required)

- **Display ECG waveform (10-second window)** using D3
- **X-axis**: Time in milliseconds
- **Y-axis**: Signal amplitude
- **Show annotations** with labels (N, S, V, A)
- **Edit annotation** label via dropdown on click
- **Highlight area** using brush
- **Display pulse rate** in selected area (beats per minute)
- **Filter annotations by label** using checkboxes

---

## 🌟 Bonus features (extra)

- ✅ **Events window**:
  - Side panel listing all annotations
  - Batch editing: select multiple rows and assign a new label
- ✅ **Lorenz Plot**:
  - Visualization of RRₙ vs RRₙ₊₁ intervals
  - Tooltip on hover
  - Axis labels and scaling
- ✅ **Show/hide toggles**:
  - Toggle annotation table
  - Toggle Lorenz plot

---

## 🚀 Tech stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [D3.js](https://d3js.org/) for data visualization

---

## 📂 Project structure

```
├── public/
│   └── ecg_graph_dto_realistic.json
├── src/
│   ├── components/
│   │   ├── EcgChart.jsx
│   │   ├── EcgChart.module.scss
│   │   ├── LorenzPlot.jsx
│   └── App.jsx
└── README.md
```

---

## 🛠️ Setup and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## 📦 Build

```bash
npm run build
```

---

## 📁 Data format

The app expects a JSON file at `public/ecg_graph_dto_realistic.json` with the following structure:

```ts
interface GraphPointDTO {
  point: number;
  timeInMs: number;
}

interface AnnotationDTO {
  beatIndex: number;
  startInMs: number;
  endInMs: number;
  rPeak: number;
  label: 'N' | 'S' | 'V' | 'A';
}

interface EcgGraphDTO {
  signals: GraphPointDTO[];
  beats: AnnotationDTO[];
}
```