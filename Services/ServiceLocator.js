const ServiceLocator = {
    services: {},

    register(name, instance) {
        this.services[name] = instance;
    }, 

    get(name) {
        return this.services[name];
    }
}

exports.ServiceLocator = ServiceLocator;