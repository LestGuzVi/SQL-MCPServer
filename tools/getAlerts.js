const axios = require('axios');

module.exports = {
    name: 'get_alerts',
    description: 'Get weather alerts for a US state.',
    inputSchema: {
        type: 'object',
        properties: {
            state: {
                type: 'string',
                description: 'Two-letter US state code (e.g. CA, NY)'
            }
        },
        required: ['state']
    },
    async handler(args) {
        const state = args.state;
        try {
            const response = await axios.get(`https://api.weather.gov/alerts/active?area=${state.toUpperCase()}`);
            const alerts = response.data.features;
            if (alerts.length === 0) {
                return `No active weather alerts for ${state.toUpperCase()}.`;
            }
            let alertsText = `Active weather alerts for ${state.toUpperCase()}:\n\n`;
            alerts.forEach((alert, index) => {
                const properties = alert.properties;
                alertsText += `${index + 1}. ${properties.headline}\n`;
                alertsText += `   Severity: ${properties.severity}\n`;
                alertsText += `   Urgency: ${properties.urgency}\n`;
                alertsText += `   Event: ${properties.event}\n`;
                alertsText += `   Description: ${properties.description}\n`;
                if (properties.instruction) {
                    alertsText += `   Instructions: ${properties.instruction}\n`;
                }
                alertsText += '\n';
            });
            return alertsText;
        } catch (error) {
            throw new Error(`Failed to fetch weather alerts: ${error.message}`);
        }
    }
};