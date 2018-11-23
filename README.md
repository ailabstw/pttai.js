Pttai.js
==========

This is the repo for web-frontend of ptt.ai.

[![Travis](https://travis-ci.org/ailabstw/pttai.js.svg?branch=master)](https://travis-ci.org/ailabstw/pttai.js)


Development setup is based on https://github.com/chhsiao1981/cc_frontend_template.git

Install
----------

```
    git clone git@gitlab.corp.ailabs.tw:ptt.ai/pttai.js.git .

    ./scripts/setup.sh
```

Development
----------

[Start go-pttai](https://github.com/ailabstw/go-pttai#development) as a separate process and then do
```
    npm start
```

#### Reference:

* create module: ./scripts/dev_module.sh [module_name]
* create container: ./scripts/dev_container.sh [container_name_page]
* create subcontainer: ./scripts/dev_subcontainer.sh [subcontainer_name]
* create component: ./scripts/dev_component.sh [component_name]

* remember to add reducers to src/reducers/index.js
* remember to add container-page to src/Routes.js
