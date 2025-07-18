const axios = require('axios');

module.exports = {
    name: 'get_forecast',
    description: 'Get weather forecast for a location.',
    inputSchema: {
        type: 'object',
        properties: {
            latitude: {
                type: 'number',
                description: 'Latitude of the location'
            },
            longitude: {
                type: 'number',
                description: 'Longitude of the location'
            }
        },
        required: ['latitude', 'longitude']
    },
    async handler(args) {
        const { latitude, longitude } = args;
        try {
            const pointResponse = await axios.get(`https://api.weather.gov/points/${latitude},${longitude}`);
            const forecastUrl = pointResponse.data.properties.forecast;
            const forecastResponse = await axios.get(forecastUrl);
            const periods = forecastResponse.data.properties.periods;
            let forecastText = `Weather forecast for ${latitude}, ${longitude}:\n\n`;
            periods.slice(0, 10).forEach((period) => {
                forecastText += `${period.name}:\n`;
                forecastText += `  Temperature: ${period.temperature}°${period.temperatureUnit}\n`;
                forecastText += `  Wind: ${period.windSpeed} ${period.windDirection}\n`;
                forecastText += `  Forecast: ${period.detailedForecast}\n\n`;
            });
            return forecastText;
        } catch (error) {
            throw new Error(`Failed to fetch weather forecast: ${error.message}`);
        }
    }
};