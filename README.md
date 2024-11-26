# Metabase

[Metabase](https://www.metabase.com) is the easy, open-source way for everyone in your company to ask questions and learn from data.

![Metabase Product Screenshot](docs/images/metabase-product-screenshot.svg)

[![Latest Release](https://img.shields.io/github/release/metabase/metabase.svg?label=latest%20release)](https://github.com/metabase/metabase/releases)
[![codecov](https://codecov.io/gh/metabase/metabase/branch/master/graph/badge.svg)](https://codecov.io/gh/metabase/metabase)
![Docker Pulls](https://img.shields.io/docker/pulls/metabase/metabase)

## Get started

The easiest way to get started with Metabase is to sign up for a free trial of [Metabase Cloud](https://store.metabase.com/checkout). You get support, backups, upgrades, an SMTP server, SSL certificate, SoC2 Type 2 security auditing, and more (plus your money goes toward improving Metabase). Check out our quick overview of [cloud vs self-hosting](https://www.metabase.com/docs/latest/cloud/cloud-vs-self-hosting). If you need to, you can always switch to [self-hosting](https://www.metabase.com/docs/latest/installation-and-operation/installing-metabase) Metabase at any time (or vice versa).

## Features

- [Set up in five minutes](https://www.metabase.com/docs/latest/setting-up-metabase.html) (we're not kidding).
- Let anyone on your team [ask questions](https://www.metabase.com/docs/latest/users-guide/04-asking-questions.html) without knowing SQL.
- Use the [SQL editor](https://www.metabase.com/docs/latest/questions/native-editor/writing-sql) for more complex queries.
- Build handsome, interactive [dashboards](https://www.metabase.com/docs/latest/users-guide/07-dashboards.html) with filters, auto-refresh, fullscreen, and custom click behavior.
- Create [models](https://www.metabase.com/learn/getting-started/models) that clean up, annotate, and/or combine raw tables.
- Define canonical [segments and metrics](https://www.metabase.com/docs/latest/administration-guide/07-segments-and-metrics.html) for your team to use.
- Send data to Slack or email on a schedule with [dashboard subscriptions](https://www.metabase.com/docs/latest/users-guide/dashboard-subscriptions).
- Set up [alerts](https://www.metabase.com/docs/latest/users-guide/15-alerts.html) to have Metabase notify you when your data changes.
- [Embed charts and dashboards](https://www.metabase.com/docs/latest/administration-guide/13-embedding.html) in your app, or even [your entire Metabase](https://www.metabase.com/docs/latest/enterprise-guide/full-app-embedding.html).

Take a [tour of Metabase](https://www.metabase.com/learn/getting-started/tour-of-metabase).

## Supported databases

- [Officially supported databases](./docs/databases/connecting.md#connecting-to-supported-databases)
- [Partner and Community drivers](./docs/developers-guide/partner-and-community-drivers.md)

## Installation

Metabase can be run just about anywhere. Check out our [Installation Guides](https://www.metabase.com/docs/latest/operations-guide/installing-metabase).

## Contributing

## Quick Setup: Dev environment

In order to spin up a development environment, you need to start the front end and the backend as follows:

### Frontend quick setup

The following command will install the Javascript dependencies:

```
$ yarn install
```

To build and run without watching changes:

```
$ yarn build
```

To build and run with hot-reload:

```
$ yarn build-hot
```

### Backend  quick setup

In order to run the backend, you'll need to build the drivers first, and then start the backend:

```
$ ./bin/build-drivers.sh
$ clojure -M:run
```

For a more detailed setup of a dev environment for Metabase, check out our [Developers Guide](./docs/developers-guide/start.md).

## Internationalization

We want Metabase to be available in as many languages as possible. See which translations are available and help contribute to internationalization using our project over at [POEditor](https://poeditor.com/join/project/ynjQmwSsGh). You can also check out our [policies on translations](https://www.metabase.com/docs/latest/administration-guide/localization.html).

## Extending Metabase

Hit our Query API from Javascript to integrate analytics. Metabase enables your application to:

- Build moderation interfaces.
- Export subsets of your users to third party marketing automation software.
- Provide a custom customer lookup application for the people in your company.

Check out our guide, [Working with the Metabase API](https://www.metabase.com/learn/administration/metabase-api).

## Security Disclosure

See [SECURITY.md](./SECURITY.md) for details.

## License

This repository contains the source code for both the Open Source edition of Metabase, released under the AGPL, as well as the [commercial editions of Metabase](https://www.metabase.com/pricing), which are released under the Metabase Commercial Software License.

See [LICENSE.txt](./LICENSE.txt) for details.

Unless otherwise noted, all files © 2024 Metabase, Inc.

## [Metabase Experts](https://www.metabase.com/partners/)

If you’d like more technical resources to set up your data stack with Metabase, connect with a [Metabase Expert](https://www.metabase.com/partners/?utm_source=readme&utm_medium=metabase-expetrs&utm_campaign=readme).


## Quantum Leap

### Dependencies

Java Development Kit (JDK):
```
sudo apt-get update
sudo apt-get install openjdk-11-jdk
```

Node.js e npm:
```
sudo apt-get install nodejs
sudo apt-get install npm
```

Yarn:
```
npm install --global yarn
```

### Run dev

Install frontend dependencies:
```
yarn install
```

Build the frontend:
```
yarn build-hot
```

Start the backend:

To start the backend, use the Clojure CLI to run the application.
```
clojure -M:run
```

## Backend
To make any changes to the QuAi feature in the backend (Clojure), navigate to [src/metabase/api/openai.clj].
In this file, you will find a Clojure controller that handles a POST request with database information and communicates with the artificial intelligence endpoint to receive and return the generated SQL query.

To add a new route to the Clojure API after creating the .clj file, go to [src/metabase/api/routes.clj].
This file contains all the predefined routes in the Clojure Metabase API. You can add new routes in the following way:
```
(context "/openai" []
  (POST "/generate-sql" request (openai/generate-sql-handler request)))
```

Make sure to import the namespace:
```
[metabase.api.openai :as openai]
```

## Frontend

To make any changes to the QuAi feature on the frontend, go to [frontend/src/metabase/quAi.jsx].
In this file, you’ll find the full screen of the feature and the logic for communication with the Clojure backend using React-Redux with dispatch to process calls and wait for data responses, such as the list of databases and table information.

To add a new route to the frontend, navigate to [frontend/src/metabase/routes.jsx] and add the following format. You need to provide the path to the file and the name of the exported component:
```
<Route path="/quai" component={QuAi} />
```

### Metabase Navigation Menu

To add a new item to the dropdown menu for new queries, go to [frontend/src/metabase/components/NewItemMenu/NewItemMenu.tsx] and add a push to the list of menu items:
```
items.push({
  title: t`QuAi`,             // Item title
  icon: "star",               // Icon
  link: "/quai",              // Component path
  onClose: onCloseNavbar,     // Close menu on item click
});
```
