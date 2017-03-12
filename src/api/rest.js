var Proxy = function (url, login, pswd) {
    var me = this;
    var filters = [], paging = [], sorter = [];

    me.getOne = function (id, success, failure) {
        if (!id) {
            console.error('Id must be set!');
        }
        if (typeof id !== 'number') {
            console.error('Id must be a number!');
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url + '/' + id, true, login, pswd);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status !== 200) {
                if (failure && typeof failure === "function") {
                    failure(xhr);
                }
            } else {
                if (success && typeof success === "function") {
                    success(xhr);
                }
            }
        };
        xhr.send();
    };
    me.getAll = function (success, failure) {
        var queryArray = [], queryString = '';
        if (filters.length) {
            queryArray = queryArray.concat(filters);
        }
        if (paging.length) {
            queryArray = queryArray.concat(paging);
        }
        if (sorter.length) {
            queryArray = queryArray.concat(sorter);
        }
        queryString = queryArray.join('&');
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url + '?' + queryString, true, login, pswd);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status !== 200) {
                if (failure && typeof failure === "function") {
                    failure(xhr);
                }
            } else {
                if (success && typeof success === "function") {
                    success(xhr);
                }
            }
        };
        xhr.send();
    };
    me.filter = function (config, success, failure) {
        filters = [];
        if (!config) {
            console.error('Filters config must be set!');
            return;
        }
        else if (typeof config !== 'object') {
            console.error('Filters config is not an object!');
            return;
        }
        if (!Object.keys(config).length) {
            console.error('Filters config object is empty!');
            return;
        }
        Object.keys(config).map(function (k) {
            var filterConfig = config[k];
            var operator, queryString;
            if (filterConfig.operator === '=') {
                operator = '';
            }
            else {
                operator = filterConfig.operator;
            }
            queryString = k + operator + '=' + filterConfig.value;
            return filters.push(queryString);
        });
        me.getAll(success, failure);
    };
    me.paging = function (config, success, failure) {
        paging = [];
        if (!config) {
            console.error('Paging config must be set!');
            return;
        }
        else if (typeof config !== 'object') {
            console.error('Paging config is not an object!');
            return;
        }
        if (!Object.keys(config).length) {
            console.error('Paging config object is empty!');
            return;
        }
        paging.push('_page=' + config.page + '&_limit=' + config.limit);
        me.getAll(success, failure);
    };
    me.sorter = function (config, success, failure) {
        sorter = [];
        if (!config) {
            console.error('Sorter config must be set!');
            return;
        }
        else if (typeof config !== 'object') {
            console.error('Sorter config is not an object!');
            return;
        }
        if (!Object.keys(config).length) {
            console.error('Sorter config object is empty!');
            return;
        }
        Object.keys(config).map(function (k) {
            var order = config[k], queryString;
            queryString = '_sort=' + k + '&_order=' + order;
            return sorter.push(queryString);
        });
        me.getAll(success, failure);
    };
    me.update = function (update, success, failure) {
        if (!update) {
            console.error('Update collection object must be set!');
            return;
        }
        else if (typeof update !== 'object') {
            console.error('Update collection is not an object!');
            return;
        }
        if (!Object.keys(update).length) {
            console.error('Update collection object is empty!');
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", url + '/' + update.id, true);
        console.log(JSON.stringify(update));
        xhr.setRequestHeader('Content-type', 'application/json');
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200) {
            if (failure && typeof failure === "function") {
                failure(xhr);
            }
        } else {
            if (success && typeof success === "function") {
                success(xhr);
            }
        }
        xhr.send(JSON.stringify(update));
    }
};


function ApiClient(url, login, pswd) {
    var user = null,
        pass = null;

    if (!url) {
        console.log('Url is not exist!');
        return;
    }
    else if (typeof url !== 'string') {
        console.log('Url must be in string format!');
        return;
    }

    if (login) {
        if (typeof login !== 'string') {
            console.log('Login must be in string format!');
            return;
        }
        user = login;
    }

    if (pswd) {
        if (typeof pswd !== 'string') {
            console.log('Password must be in string format!');
            return;
        }
        pass = pswd;
    }
    return new Proxy(url, user, pass);
}

export default ApiClient