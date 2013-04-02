module.exports = {
    sirvlog: {
        'facility': 'logparser',
        backlogLimit: 2500,
        'server': {
            'address': '127.0.0.1',
            'port': 12514
        }
    },

    delay: 1000, // delay in ms between parse runs

    configDir: './conf.d.example',

    runtimeDir: './runtime'
}
