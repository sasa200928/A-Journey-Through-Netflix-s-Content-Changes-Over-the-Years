# A-Journey-Through-Netflix-s-Content-Changes-Over-the-Years
FINAL PROJECT CIS 568-7101: Data Visualization - On-Line (2025 Spring CE1)


# Netflix Content Evolution Visualization
# A Journey Through Netflix's Content Changes Over the Years

## Project Overview
This project presents an interactive visualization of Netflix's content library, showcasing the evolution of content types, genres, and origins over time. The visualization provides insights into Netflix's content strategy and growth patterns through various interactive charts and graphs.

## Develped by: Shams Alfaris
## Supervised by : Professor DR. Amir AkhavanMasoumi
## FINAL PROJECT
## CIS 568-7101: Data Visualization - On-Line (2025 Spring CE1)

## How to Run
1. Clone the repository to your local machine
2. Ensure you have a modern web browser installed (Chrome, Firefox, or Edge recommended)
3. Open `index9.html` in your web browser
4. The visualization will load automatically with the Netflix content data

### Frontend Implementation
- HTML5, CSS3, and JavaScript
- D3.js for force-directed graph visualization
- Chart.js for bar and pie charts
- Plotly.js for additional visualizations
- Responsive design for different screen sizes


### Project Structure
```
netflix-visualization/
├── data/
│   └── nextflix_titles.json
├── libs/
│   ├── d3.v7.min.js
│   └── topojson@3
├── styles.css
├── main.js
├── index9.html
└── README.md
```

## Visualization Components

### 1. Content Type Distribution
- **Visualization Type**: Pie Chart
- **Encoding**:
  - Color: Red (#E50914) for Movies, Dark Gray (#221f1f) for TV Shows
  - Size: Represents the proportion of content types
- **Interaction**: Static display showing the overall distribution of Movies vs TV Shows

### 2. Genre Distribution
- **Visualization Type**: Bar Chart
- **Encoding**:
  - X-axis: Genre names
  - Y-axis: Number of titles
  - Color: Different colors for each genre
- **Interaction**: Updates based on selected year, showing top 10 genres

### 3. Content Origin
- **Visualization Type**: Pie Chart
- **Encoding**:
  - Color: Different colors for each country
  - Size: Represents the proportion of content from each country
- **Interaction**: Updates based on selected year, showing top 10 content-producing countries

### 4. International Movies
- **Visualization Type**: Bar Chart
- **Encoding**:
  - X-axis: Years
  - Y-axis: Number of international movies
  - Color: Netflix Red (#E50914)
- **Interaction**: Shows the trend of international movie production over time

### 5. Content Relationship Graph
- **Visualization Type**: Force-directed Graph
- **Encoding**:
  - Nodes: Content items (Movies/TV Shows)
  - Links: Relationships between content
  - Color: Different colors for Movies and TV Shows
- **Interaction**: 
  - Draggable nodes
  - Hover for details
  - Year-based filtering

### 6. Timeline Slider
- **Visualization Type**: Interactive Slider
- **Encoding**:
  - Position: Represents years
  - Color: Netflix Red (#E50914) for the thumb
- **Interaction**: 
  - Drag to select different years
  - Updates all visualizations to show data for the selected year

## Data Source
The visualization uses Netflix content data stored in `data/nextflix_titles.json`. The dataset includes information about:
- Content type (Movie/TV Show)
- Release year
- Genre
- Country of origin
- Duration
- Rating

## Technical Implementation
- Built using HTML, CSS, and JavaScript
- Uses D3.js for force-directed graph
- Chart.js for bar and pie charts
- Plotly.js for additional visualizations
- Responsive design for different screen sizes

## Screenshot
- ![alt text](image.png)
- ![alt text](image-1.png)
- ![alt text](image-2.png)
- ![alt text](image-3.png)
- ![alt text](image-4.png)
- ![alt text](image-5.png)



## Notes
- The visualization requires an internet connection to load the required JavaScript libraries
- All data is loaded client-side from the JSON file
- The interface is optimized for modern web browsers 