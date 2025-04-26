import { loadData } from './data-loader.js';

const contentTooltip = d3.select("#content-tooltip");
let allContentData = [];
let internationalMovieChart;
let genreDistributionChart;
let contentOriginChart;

document.addEventListener('DOMContentLoaded', function() {
    const yearSlider = document.getElementById('year-slider');
    const selectedYearDisplay = document.getElementById('selected-year');
    
    yearSlider.addEventListener('input', function() {
        const year = this.value;
        selectedYearDisplay.textContent = year;
        
        const filteredData = allContentData.filter(item => item.release_year === parseInt(year));
        renderContentGraph(allContentData, year);
        renderGenreDistributionChart(allContentData, year);
        renderContentOriginChart(allContentData, year);
    });
});

function showContentTooltip(event, d) {
    contentTooltip.transition()
        .duration(200)
        .style("opacity", 1);
    
    let tooltipContent = `
        <h3>${d.title || 'Untitled'}</h3>
        <p><strong>Type:</strong> ${d.type || 'Unknown'}</p>
        ${d.director ? `<p><strong>Director:</strong> ${d.director}</p>` : ''}
        ${d.cast ? `<p><strong>Cast:</strong> ${d.cast}</p>` : ''}
        ${d.country ? `<p><strong>Country:</strong> ${d.country}</p>` : ''}
        ${d.release_year ? `<p><strong>Release Year:</strong> ${d.release_year}</p>` : ''}
        ${d.rating ? `<p><strong>Rating:</strong> ${d.rating}</p>` : ''}
        ${d.duration ? `<p><strong>Duration:</strong> ${d.duration}</p>` : ''}
        ${d.listed_in ? `<p><strong>Genres:</strong> ${d.listed_in}</p>` : ''}
        ${d.description ? `<p><strong>Description:</strong> ${d.description}</p>` : ''}
    `;

    contentTooltip.html(tooltipContent)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 15) + "px");
}

function hideContentTooltip() {
    contentTooltip.transition()
        .duration(200)
        .style("opacity", 0);
}

function renderOverallContentTypeSummary(data) {
    const total = data.filter(item => item.type === 'Movie' || item.type === 'TV Show').length;
    const movieCount = data.filter(d => d.type === "Movie").length;
    const tvShowCount = total - movieCount;
    const moviePercent = total > 0 ? ((movieCount / total) * 100).toFixed(1) : 0;
    const tvPercent = total > 0 ? ((tvShowCount / total) * 100).toFixed(1) : 0;

    document.getElementById("overall-content-type-summary").innerHTML = `OverallContent Type Distribution: <span style="color:#E50914;">${moviePercent}% Movies</span> | <span style="color:#221f1f;">${tvPercent}% TV Shows</span>`;

    d3.select("#content-type-pie").selectAll("*").remove();

    const pieData = [
        { type: "Movie", count: movieCount },
        { type: "TV Show", count: tvShowCount }
    ];
    const pieWidth = 120, pieHeight = 120, radius = Math.min(pieWidth, pieHeight) / 2;
    const color = d3.scaleOrdinal()
        .domain(["Movie", "TV Show"])
        .range(["#E50914", "#221f1f"]);
    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().innerRadius(25).outerRadius(radius - 5);
    const pieSvg = d3.select("#content-type-pie")
        .attr("width", pieWidth)
        .attr("height", pieHeight)
        .append("g")
        .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

    const pieSlices = pieSvg.selectAll("path")
        .data(pie(pieData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.type === "Movie" ? "#E50914" : "#221f1f")
        .attr("stroke", "#fff")
        .attr("stroke-width", "2")
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 0.8)
        .attr("d", arc)
        .delay((d, i) => i * 100)
        .style("filter", "drop-shadow(0 0 5px rgba(255, 0, 0, 0.7))");

    const totalContent = movieCount + tvShowCount;
    const moviePercentage = totalContent > 0 ? Math.round((movieCount / totalContent) * 100) : 0;
    const tvShowPercentage = totalContent > 0 ? Math.round((tvShowCount / totalContent) * 100) : 0;

    pieSvg.selectAll("text")
        .data(pie(pieData))
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "10px")
        .style("fill", "#fff")
        .style("pointer-events", "none")
        .text(d => `${Math.round((d.data.count / totalContent) * 100)}%`)
        .style("opacity", 0)
        .transition()
        .duration(800)
        .style("opacity", 1)
        .delay((d, i) => i * 150);
}

function renderContentGraph(data, year) {
    year = parseInt(year);
    console.log('Creating graph for year:', year);
    
    const filteredData = data.filter(item => {
        if (!item || !item.release_year) {
            console.log('Skipping item missing release year:', item);
            return false;
        }
        
        const releaseYear = parseInt(item.release_year);
        if (isNaN(releaseYear)) {
            console.log('Skipping item with invalid year:', item.release_year);
            return false;
        }
        
        const matches = releaseYear === year && (item.type === 'Movie' || item.type === 'TV Show');
        if (!matches) {
            console.log('Item filtered out:', {
                releaseYear,
                year,
                type: item.type
            });
        }
        return matches;
    });

    console.log(`Found ${filteredData.length} items for ${year}`);
    if (filteredData.length === 0) {
        console.log('No content found for year:', year);
    }

    const svg = d3.select("#content-svg");
    const width = 2000;
    const height = 1400;
    svg.attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    if (filteredData.length === 0) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .style("fill", "#fff")
            .style("font-size", "20px")
            .text(`No movies or TV shows found for the year ${year}`);
        return;
    }

    const radius = Math.min(width, height) / 1.6;
    const angleStep = (2 * Math.PI) / filteredData.length;
    
    filteredData.sort((a, b) => (a.type === 'Movie' ? -1 : 1));
    
    const nodes = filteredData.map((item, i) => ({
        id: item.show_id || Math.random().toString(36).substr(2, 9),
        title: item.title || 'Unknown Title',
        type: item.type || 'Unknown',
        release_year: item.release_year,
        director: item.director || '',
        cast: item.cast || '',
        country: item.country || '',
        listed_in: item.listed_in || '',
        description: item.description || '',
        x: width/2 + radius * Math.cos(i * angleStep),
        y: height/2 + radius * Math.sin(i * angleStep),
        initialX: width/2 + radius * Math.cos(i * angleStep),
        initialY: height/2 + radius * Math.sin(i * angleStep)
    }));

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const node1 = nodes[i];
            const node2 = nodes[j];
            
            if (node1.director && node2.director && node1.director === node2.director) {
                links.push({ 
                    source: node1, 
                    target: node2, 
                    type: 'director',
                    strength: 1.0 
                });
            }
            
            if (node1.cast && node2.cast) {
                const cast1 = node1.cast.split(', ').map(s => s.trim());
                const cast2 = node2.cast.split(', ').map(s => s.trim());
                const commonCast = cast1.filter(actor => cast2.includes(actor));
                if (commonCast.length > 0) {
                    links.push({ 
                        source: node1, 
                        target: node2, 
                        type: 'cast',
                        strength: commonCast.length / 5
                    });
                }
            }
        }
    }

    const simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2).strength(1))
        .force("collide", d3.forceCollide().radius(80))
        .force("radial", d3.forceRadial(radius, width / 2, height / 2).strength(0.8))
        .force("link", d3.forceLink(links).strength(d => d.strength * 0.2))
        .velocityDecay(0.8)
        .alphaDecay(0.05)
        .alphaTarget(0);

    const zoom = d3.zoom()
        .scaleExtent([0.1, 5])
        .on("zoom", (event) => {
            container.attr("transform", event.transform);
        });

    const container = svg.append("g");
    svg.call(zoom);

    const link = container.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", d => d.type === 'director' ? '#E50914' : '#404040')
        .attr("stroke-width", d => d.type === 'director' ? 2 : 1)
        .attr("stroke-opacity", d => d.type === 'director' ? 0.4 : 0.2);

    const node = container.selectAll(".content-node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", d => `content-node ${d.type.toLowerCase().replace(' ', '-')}`)
        .attr("r", 15)
        .style("fill", d => d.type === "Movie" ? "#E50914" : "#FFA500")
        .style("stroke", "#fff")
        .style("stroke-width", 3)
        .style("cursor", "pointer")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", (event, d) => {
            const connectedNodes = new Set();
            links.forEach(link => {
                if (link.source === d) connectedNodes.add(link.target);
                if (link.target === d) connectedNodes.add(link.source);
            });
            
            node.style("opacity", n => connectedNodes.has(n) || n === d ? 1 : 0.3);
            link.style("stroke-opacity", l => (l.source === d || l.target === d) ? 
                (l.type === 'director' ? 0.8 : 0.4) : 
                (l.type === 'director' ? 0.4 : 0.2));
            
            event.currentTarget.parentNode.appendChild(event.currentTarget);
            const label = container.selectAll(".label-group").filter(l => l.id === d.id).node();
            if (label) label.parentNode.appendChild(label);
            
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr("r", 22)
                .style("stroke-width", 4);
            showContentTooltip(event, d);
        })
        .on("mouseout", (event, d) => {
            node.style("opacity", 1);
            link.style("stroke-opacity", d => d.type === 'director' ? 0.4 : 0.2);
            
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr("r", 15)
                .style("stroke-width", 3);
            hideContentTooltip();
        });

    const labelGroup = container.selectAll(".label-group")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "label-group");

    labelGroup.append("rect")
        .attr("class", "label-background")
        .style("fill", "rgba(20, 20, 20, 0.9)")
        .style("rx", "5")
        .style("ry", "5");

    const label = labelGroup.append("text")
        .attr("class", "content-label")
        .text(d => {
            const title = d.title || 'Untitled';
            return title.length > 30 ? title.substring(0, 30) + '...' : title;
        })
        .attr("dy", 4)
        .style("font-size", "16px")
        .style("font-family", "Arial")
        .style("fill", "#fff")
        .style("font-weight", "bold")
        .style("pointer-events", "none");

    labelGroup.each(function() {
        const text = d3.select(this).select("text");
        const bbox = text.node().getBBox();
        const padding = 8;
        
        d3.select(this).select("rect")
            .attr("x", bbox.x - padding)
            .attr("y", bbox.y - padding)
            .attr("width", bbox.width + (padding * 2))
            .attr("height", bbox.height + (padding * 2));
    });

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        labelGroup
            .attr("transform", d => `translate(${d.x + 20},${d.y})`);
    });

    const style = document.createElement('style');
    style.textContent = `
        .content-label {
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            fill: #fff;
            text-shadow: 0 2px 4px rgba(0,0,0,0.9);
        }
        .content-node {
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));
        }
        .label-background {
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));
        }
    `;
    document.head.appendChild(style);

    const bounds = container.node().getBBox();
    const dx = bounds.width;
    const dy = bounds.height;
    const x = bounds.x + (bounds.width / 2);
    const y = bounds.y + (bounds.height / 2);
    const scale = Math.min(0.7, Math.min(width / dx, height / dy));
    const translate = [width / 2 - scale * x, height / 2 - scale * y];
    
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity
            .translate(translate[0], translate[1])
            .scale(scale));

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    setTimeout(() => {
        simulation.stop();
    }, 2000);
}

function renderInternationalMoviesChart(data) {
    if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        return;
    }

    const years = [...new Set(data.map(item => item.release_year))].sort();
    const countryCounts = {};

    data.forEach(item => {
        if (item.type === 'Movie' && item.country) {
            const countries = item.country.split(', ').map(c => c.trim());
            countries.forEach(country => {
                if (!countryCounts[country]) {
                    countryCounts[country] = {};
                }
                if (!countryCounts[country][item.release_year]) {
                    countryCounts[country][item.release_year] = 0;
                }
                countryCounts[country][item.release_year]++;
            });
        }
    });

    const countryTotalCounts = {};
    for (const country in countryCounts) {
        let total = 0;
        for (const year in countryCounts[country]) {
            total += countryCounts[country][year];
        }
        countryTotalCounts[country] = total;
    }

    const sortedCountries = Object.entries(countryTotalCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)
        .map(([country]) => country);

    const datasets = sortedCountries.map((country, index) => {
        return {
            label: country,
            data: years.map(year => countryCounts[country] ? countryCounts[country][year] || 0 : 0),
            backgroundColor: ['#e50914', '#f5b700', '#3498db', '#2ecc71', '#9b59b6'][index],
            borderColor: ['#e50914', '#f5b700', '#3498db', '#2ecc71', '#9b59b6'][index],
        };
    });

    const chartData = {
        labels: years,
        datasets: datasets
    };

    const ctx = document.getElementById('internationalMovieChart').getContext('2d');

    if (internationalMovieChart) {
        internationalMovieChart.destroy();
    }

    internationalMovieChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Year',
                        color: '#e5e5e5'
                    },
                    ticks: {
                        color: '#e5e5e5'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Number of Movies',
                        color: '#e5e5e5'
                    },
                    ticks: {
                        color: '#e5e5e5',
                        beginAtZero: true
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#e5e5e5',
                        usePointStyle: false,
                        boxWidth: 10,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        title: (context) => {
                            return context[0].label;
                        },
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.formattedValue;
                            return label;
                        },
                        footer: (context) => {
                            let sum = 0;
                            years.forEach((year, index) => {
                                sum += context.chart.data.datasets.reduce((acc, dataset) => acc + (dataset.data[index] || 0), 0);
                            });
                            return `Total: ${sum}`;
                        }
                    }
                }
            }
        }
    });
}

function renderGenreDistributionChart(data, selectedYear) {
    selectedYear = String(selectedYear);
    const yearData = data.filter(item => String(item.release_year) === selectedYear);
    const genreCounts = {};

    yearData.forEach(item => {
        if (item.listed_in) {
            const genres = item.listed_in.split(', ').map(g => g.trim());
            genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        }
    });

    const sortedGenres = Object.entries(genreCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 10);

    const chartContainer = document.getElementById('genre-distribution-chart-container');
    chartContainer.style.height = '400px';
    chartContainer.style.marginTop = '20px';

    const ctx = document.getElementById('genreDistributionChart').getContext('2d');
    
    if (genreDistributionChart) {
        genreDistributionChart.destroy();
    }

    genreDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedGenres.map(g => g[0]),
            datasets: [{
                label: `Top Genres in ${selectedYear}`,
                data: sortedGenres.map(g => g[1]),
                backgroundColor: [
                    '#e50914', '#f5b700', '#3498db', '#2ecc71', '#9b59b6',
                    '#e74c3c', '#1abc9c', '#f1c40f', '#34495e', '#d35400'
                ],
                borderColor: '#333',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: '#e5e5e5',
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    },
                    title: {
                        display: true,
                        text: 'Genre',
                        color: '#e5e5e5',
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e5e5e5'
                    },
                    title: {
                        display: true,
                        text: 'Number of Titles',
                        color: '#e5e5e5',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e5e5e5',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} titles`;
                        }
                    }
                }
            }
        }
    });

    const titleElement = document.getElementById('genre-distribution-chart-title');
    titleElement.textContent = `Genre Distribution for ${selectedYear}`;
}

function renderContentOriginChart(data, selectedYear) {
    // Filter data for the selected year
    const yearData = data.filter(d => parseInt(d.release_year) === parseInt(selectedYear));
    
    // Count occurrences by country
    const countryData = {};
    yearData.forEach(d => {
        if (d.country) {
            const countries = d.country.split(', ');
            countries.forEach(country => {
                const trimmedCountry = country.trim();
                countryData[trimmedCountry] = (countryData[trimmedCountry] || 0) + 1;
            });
        }
    });

    // Sort and get top 10 countries
    const sortedCountries = Object.entries(countryData)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    // Get the canvas element
    const canvas = document.getElementById('contentOriginChart');
    if (!canvas) {
        console.error('Content Origin Chart canvas not found');
        return;
    }

    // Destroy existing chart if it exists
    if (contentOriginChart) {
        contentOriginChart.destroy();
    }

    // Create new chart
    contentOriginChart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: sortedCountries.map(([country]) => country),
            datasets: [{
                data: sortedCountries.map(([, count]) => count),
                backgroundColor: [
                    '#E50914',  // Bright red (Netflix red)
                    '#B71C1C',  // Dark red
                    '#D32F2F',  // Medium red
                    '#C62828',  // Another medium red
                    '#F44336',  // Lighter red
                    '#EF5350',  // Even lighter red
                    '#E57373',  // Light red
                    '#FF8A80',  // Very light red
                    '#FFCDD2',  // Super light red
                    '#FFEBEE'   // Almost white red
                ],
                borderWidth: 1,
                borderColor: '#141414'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} titles (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Update the title
    const titleElement = document.getElementById('content-origin-chart-title');
    if (titleElement) {
        titleElement.textContent = `Content Origin Distribution (${selectedYear})`;
    }
}

function initializeYearButtons(data) {
    allContentData = data;
    renderOverallContentTypeSummary(allContentData);

    const years = [...new Set(data.map(item => {
        const year = parseInt(item.release_year);
        return isNaN(year) ? null : year;
    }).filter(year => year !== null))].sort((a, b) => a - b);

    console.log('Available years:', years);

    const yearButtonsDiv = document.getElementById("year-buttons");
    yearButtonsDiv.innerHTML = '';
    let firstYear = null;

    years.forEach(year => {
        const button = document.createElement("button");
        button.textContent = year;
        button.addEventListener("click", () => {
            document.querySelectorAll("#year-buttons button").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            console.log('Button clicked for year:', year);
            renderContentGraph(data, year);
            renderGenreDistributionChart(data, year);
            renderContentOriginChart(data, year);
        });
        yearButtonsDiv.appendChild(button);
        if (!firstYear) {
            firstYear = year;
            button.classList.add("active");
            console.log('Initializing with year:', year);
            renderContentGraph(data, year);
            renderGenreDistributionChart(data, year);
            renderContentOriginChart(data, year);
        }
    });
    renderInternationalMoviesChart(data);
}

function countUniqueCountries(data) {
    
    const uniqueCountries = new Set();
    
    data.forEach(item => {
        if (item.country) {
            
            const countries = item.country.split(', ');
            countries.forEach(country => {
                uniqueCountries.add(country.trim());
            });
        }
    });

    
    const countriesArray = Array.from(uniqueCountries).sort();
    
    console.log(`Total number of unique countries: ${uniqueCountries.size}`);
    console.log('List of all countries:', countriesArray);
    
    return uniqueCountries;
}

function updateLineChart(data) {
    
    const contentByYear = {};
    
   
    for (let year = 1925; year <= 2021; year++) {
        contentByYear[year] = {
            'Movie': 0,
            'TV Show': 0
        };
    }

    
    data.forEach(item => {
        if (item.release_year) {
            const year = parseInt(item.release_year);
            if (year >= 1925 && year <= 2021) {
                contentByYear[year][item.type]++;
            }
        }
    });

   
    const years = Object.keys(contentByYear).map(Number).sort((a, b) => a - b);
    const movieCounts = years.map(year => contentByYear[year]['Movie']);
    const tvShowCounts = years.map(year => contentByYear[year]['TV Show']);

    
    const trace1 = {
        x: years,
        y: movieCounts,
        name: 'Movies',
        type: 'scatter',
        mode: 'lines',
        line: {
            color: '#E50914',
            width: 2
        }
    };

    const trace2 = {
        x: years,
        y: tvShowCounts,
        name: 'TV Shows',
        type: 'scatter',
        mode: 'lines',
        line: {
            color: '#221f1f',
            width: 2
        }
    };

    const layout = {
        showlegend: false,
        margin: {
            l: 40,
            r: 20,
            t: 20,
            b: 40
        },
        xaxis: {
            showticklabels: true,
            tickangle: 45,
            dtick: 10, 
            tickfont: {
                size: 10,
                color: '#333'
            },
            title: {
                text: 'Year',
                standoff: 10
            }
        },
        yaxis: {
            showticklabels: true,
            tickfont: {
                size: 10,
                color: '#333'
            },
            title: {
                text: 'Number of Titles',
                standoff: 10
            }
        },
        font: {
            family: 'Arial, Helvetica, sans-serif'
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        width: 270,
        height: 200,
        hovermode: 'x unified',
        hoverlabel: {
            bgcolor: '#FFF',
            font: {color: '#333'}
        }
    };

    const config = {
        displayModeBar: false,
        responsive: true
    };

    Plotly.newPlot('lineChart', [trace1, trace2], layout, config);
}

function updateRatingChart(data) {
    const ratingCounts = {};
    
    data.forEach(item => {
        const rating = item.rating || 'Unrated';
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });

    const sortedRatings = Object.entries(ratingCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const ratings = sortedRatings.map(([rating]) => rating);
    const counts = sortedRatings.map(([, count]) => count);

    const trace = {
        x: ratings,
        y: counts,
        type: 'bar',
        marker: {
            color: ratings.map((_, index) => {

                const ratio = index / (ratings.length - 1);
                return `rgba(${229 * (1 - ratio) + 34 * ratio}, ${9 * (1 - ratio) + 31 * ratio}, ${20 * (1 - ratio) + 31 * ratio}, 0.8)`;
            })
        }
    };

    const layout = {
        showlegend: false,
        margin: {
            l: 40,
            r: 20,
            t: 20,
            b: 60
        },
        xaxis: {
            showticklabels: true,
            tickangle: 45,
            tickfont: {
                size: 10,
                color: '#333'
            },
            title: {
                text: 'Rating',
                standoff: 20
            }
        },
        yaxis: {
            showticklabels: true,
            tickfont: {
                size: 10,
                color: '#333'
            },
            title: {
                text: 'Number of Titles',
                standoff: 10
            }
        },
        font: {
            family: 'Arial, Helvetica, sans-serif'
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        width: 270,
        height: 200,
        bargap: 0.2,
        hoverlabel: {
            bgcolor: '#FFF',
            font: {color: '#333'}
        }
    };

    const config = {
        displayModeBar: false,
        responsive: true
    };

    Plotly.newPlot('ratingChart', [trace], layout, config);
}

function updateGenrePieChart(data) {
    const genreCounts = {};
    
    data.forEach(item => {
        if (item.listed_in) {
            const genres = item.listed_in.split(', ').map(g => g.trim());
            genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        }
    });

    const sortedGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const genres = sortedGenres.map(([genre]) => genre);
    const counts = sortedGenres.map(([, count]) => count);

    const colors = genres.map((_, index) => {
        const ratio = index / (genres.length - 1);
        return `rgba(${229 * (1 - ratio) + 34 * ratio}, ${9 * (1 - ratio) + 31 * ratio}, ${20 * (1 - ratio) + 31 * ratio}, 0.9)`;
    });

    const trace = {
        values: counts,
        labels: genres,
        type: 'pie',
        hole: 0.4,
        textinfo: 'percent',
        textposition: 'inside',
        insidetextfont: {
            size: 12,  
            color: '#ffffff',
            weight: 'bold'
        },
        marker: {
            colors: colors
        },
        hoverinfo: 'label+percent+value',
        direction: 'clockwise',
        sort: true,
        textfont: {
            size: 12,
            color: '#ffffff',
            weight: 'bold'
        }
    };

    const layout = {
        showlegend: true,
        legend: {
            orientation: 'v',
            x: 1.1,
            y: 0.5,
            font: {
                size: 11,  
                color: '#333',
                weight: 'bold'
            }
        },
        margin: {
            l: 20,
            r: 120,  
            t: 20,
            b: 20
        },
        font: {
            family: 'Arial, Helvetica, sans-serif',
            weight: 'bold'
        },
        width: 300,    
        height: 250,   
        paper_bgcolor: 'rgba(0,0,0,0)',
        hoverlabel: {
            bgcolor: '#FFF',
            font: {
                color: '#333',
                size: 12,
                weight: 'bold'
            }
        }
    };

    const config = {
        displayModeBar: false,
        responsive: true
    };

    Plotly.newPlot('genrePieChart', [trace], layout, config);

    
    const legendContainer = document.getElementById('genre-legend');
    legendContainer.innerHTML = genres.map((genre, index) => `
        <div>
            <div style="background-color: ${colors[index]};"></div>
            <span style="font-size: 13px; color: #333; font-weight: 500;">${genre} (${counts[index]})</span>
        </div>
    `).join('');
}

function updateBubbleChart(data) {
   
    const processedData = data.map(item => {
        let durationValue = 0;
        if (item.duration) {
            const match = item.duration.match(/(\d+)/);
            if (match) {
                durationValue = parseInt(match[1]);
                
                if (item.duration.includes('Season')) {
                    durationValue *= 10;
                }
            }
        }
        return {
            type: item.type,
            year: parseInt(item.release_year),
            duration: durationValue
        };
    }).filter(item => item.duration > 0 && item.year);


    const movieData = processedData.filter(item => item.type === 'Movie');
    const tvShowData = processedData.filter(item => item.type === 'TV Show');

    
    const movieTrace = {
        x: movieData.map(d => d.year),
        y: movieData.map(d => d.duration),
        mode: 'markers',
        name: 'Movies',
        marker: {
            size: 8,
            color: '#E50914',
            opacity: 0.7,
            line: {
                color: '#fff',
                width: 1
            }
        },
        type: 'scatter',
        hovertemplate: 
            '<b>Movie</b><br>' +
            'Year: %{x}<br>' +
            'Duration: %{y} min<br>' +
            '<extra></extra>'
    };

    const tvShowTrace = {
        x: tvShowData.map(d => d.year),
        y: tvShowData.map(d => d.duration),
        mode: 'markers',
        name: 'TV Shows',
        marker: {
            size: 8,
            color: '#221f1f',
            opacity: 0.7,
            line: {
                color: '#fff',
                width: 1
            }
        },
        type: 'scatter',
        hovertemplate: 
            '<b>TV Show</b><br>' +
            'Year: %{x}<br>' +
            'Duration: %{y} episodes<br>' +
            '<extra></extra>'
    };

    const layout = {
        showlegend: false,
        margin: {
            l: 50,
            r: 20,
            t: 20,
            b: 40
        },
        xaxis: {
            title: {
                text: 'Release Year',
                standoff: 10,
                font: {
                    size: 12,
                    color: '#333',
                    weight: 'bold'
                }
            },
            tickfont: {
                size: 10,
                color: '#333'
            }
        },
        yaxis: {
            title: {
                text: 'Duration (min/episodes)',
                standoff: 10,
                font: {
                    size: 12,
                    color: '#333',
                    weight: 'bold'
                }
            },
            tickfont: {
                size: 10,
                color: '#333'
            }
        },
        font: {
            family: 'Arial, Helvetica, sans-serif'
        },
        width: 300,
        height: 250,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        hoverlabel: {
            bgcolor: '#FFF',
            font: {
                size: 12,
                color: '#333'
            }
        }
    };

    const config = {
        displayModeBar: false,
        responsive: true
    };

    Plotly.newPlot('bubbleChart', [movieTrace, tvShowTrace], layout, config);
}

async function initializeApp() {
    try {
        const data = await loadData();
        console.log('Data loaded successfully:', data.length, 'items');
        allContentData = data;
        renderOverallContentTypeSummary(data);
        renderGenreDistributionChart(data, "2020");
        renderInternationalMoviesChart(data);
        initializeYearButtons(data);
        updateBarChart(data);
        updateLineChart(data);
        updateRatingChart(data);
        updateGenrePieChart(data);
        updateBubbleChart(data);
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

initializeApp();

function updateBarChart(data) {
  
    const countryTypeCounts = {};
    
    data.forEach(item => {
        const country = item.country || 'Unknown';
        const type = item.type;
        
        if (!countryTypeCounts[country]) {
            countryTypeCounts[country] = {
                'Movie': 0,
                'TV Show': 0
            };
        }
        
        countryTypeCounts[country][type]++;
    });

    
    const sortedCountries = Object.keys(countryTypeCounts)
        .sort((a, b) => {
            const totalA = countryTypeCounts[a]['Movie'] + countryTypeCounts[a]['TV Show'];
            const totalB = countryTypeCounts[b]['Movie'] + countryTypeCounts[b]['TV Show'];
            return totalB - totalA;
        })
        .slice(0, 5); 

    
    const movieCounts = sortedCountries.map(country => countryTypeCounts[country]['Movie']);
    const tvShowCounts = sortedCountries.map(country => countryTypeCounts[country]['TV Show']);

    
    const trace1 = {
        x: sortedCountries,
        y: movieCounts,
        name: 'Movies',
        type: 'bar',
        marker: {
            color: '#E50914' 
        }
    };

    const trace2 = {
        x: sortedCountries,
        y: tvShowCounts,
        name: 'TV Shows',
        type: 'bar',
        marker: {
            color: '#221f1f' 
        }
    };

    const layout = {
        barmode: 'group',
        showlegend: false,
        margin: {
            l: 40,
            r: 20,
            t: 20,
            b: 60  
        },
        xaxis: {
            showticklabels: true,
            tickangle: 45, 
            tickfont: {
                size: 10,
                color: '#333'
            }
        },
        yaxis: {
            showticklabels: true,
            tickfont: {
                size: 10,
                color: '#333'
            }
        },
        font: {
            family: 'Arial, Helvetica, sans-serif'
        },
        paper_bgcolor: 'rgba(0,0,0,0)',  
        plot_bgcolor: 'rgba(0,0,0,0)'    
    };

    const config = {
        displayModeBar: false,  
        responsive: true
    };

    Plotly.newPlot('barChart', [trace1, trace2], layout, config);
}

const style = document.createElement('style');
style.textContent = `
    #genre-legend {
        margin-top: 15px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 13px;
        font-weight: 500;
    }
    #genre-legend div {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    #genre-legend div div {
        width: 15px;
        height: 15px;
        border-radius: 3px;
        flex-shrink: 0;
    }
    .chart-box {
        margin-bottom: 25px;
    }
`;
document.head.appendChild(style);


const tooltipStyle = document.createElement('style');
tooltipStyle.textContent = `
    #content-tooltip {
        position: absolute;
        pointer-events: none;
        z-index: 1000;
        background-color: rgba(255, 255, 255, 0.98);
        border-radius: 4px;
        font-family: Arial, sans-serif;
        max-width: 500px;
        word-wrap: break-word;
    }
    #content-tooltip h3 {
        font-size: 16px;
        margin-bottom: 10px;
        color: #333;
    }
    #content-tooltip strong {
        color: #333;
        font-weight: bold;
    }
    #content-tooltip div {
        margin-bottom: 8px;
        color: #666;
        line-height: 1.4;
    }
    #content-tooltip div:last-child {
        margin-bottom: 0;
    }
`;
document.head.appendChild(tooltipStyle);


const graphStyle = document.createElement('style');
graphStyle.textContent = `
    .content-node {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .content-node:hover {
        stroke: #fff;
        stroke-width: 3px;
    }
    .content-label {
        pointer-events: none;
        user-select: none;
    }
    #content-tooltip {
        position: absolute;
        pointer-events: none;
        z-index: 1000;
        background-color: rgba(255, 255, 255, 0.98);
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        padding: 15px;
        font-family: Arial, sans-serif;
        font-size: 13px;
        max-width: 500px;
        word-wrap: break-word;
    }
`;
document.head.appendChild(graphStyle);
