![](https://github.com/thenick775/terbine_visualizations/blob/master/australia_solar/graphics/demo.png)

This interactive choropleth map describes the estimates of actual regional rooftop solar generation in Australia, with a granularity of half an hour.

The data is mapped to the 'plasma' color scale,

![](https://github.com/thenick775/terbine_visualizations/blob/master/australia_solar/graphics/plasmaex.png)

where colors to the left indicate low values, and colors to the right indicate high values.

The data originally was broken down into the different original AEMO regions:

NSW1
QLD1 (Queensland)
QLDC (Queensland Central)
QLDN (Queensland North)
QLDS (Queensland South)
SA1  (South Australia)
TAS1 (Tasmania)
TASN (Tasmania North)
TASS (Tasmania South)
VIC1 (Victoria)

To make for an accurate country wide visualization, values from Queensland and Tasmania were each aggregated together to show their total output relative to the other regions present.

We can see after examination of the choropleth map, that the regions with higher populations are generating the most power using rooftop solar installations. In the regions with lower generation values, this could be due to the geographic spread of the regional population, or this could be an indicator that there exist natural or infrastructure related impasses to increasing rooftop photovoltaic output in those areas.

Below we can see in more detail the differences between regional generation output as a function of time:

![](https://github.com/thenick775/terbine_visualizations/blob/master/australia_solar/graphics/ausave.png)

Using this data, and related governmental datasets, we could examine the causes of this disparity, and identify solutions to address this based on regional features such as weather, population density, population spread, fossil fuel usage, and existing infrastructure. This will allow us to use real world data to address the needs of indiviuals, and the planet as the world continues to increase its renewable energy output and transition away from fossil fuel technology.

Data Sources:

Solar Generation (Continuous data): terbine.io, feed: Photovoltaic Energy Generation / Nationwide Australia, GUID: fae95231-3f26-493d-a1ef-6b49e5cc021b

Technologies Used:

Javascript

d3.js

leaflet.js

Matplotlib

Jupyter-Notebook
