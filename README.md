# uni-app-project <img style="float: right; padding: 10px;" alt="views counter" src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FWORTI31212%2Funi-app-project-v2&count_bg=%23005CB8&title_bg=%23555555&icon=&icon_color=%23EB0000&title=VIEWS&edge_flat=false">

"Faultifier" is a secure yet simple web application built with [Node.js][node], [Express][express], and [Typescript][typescript]. It provides a platform for company employees to log hardware or software faults, track their tickets, and manage the fault reporting process.

Deployed Site: <https://uni-app-project-production.up.railway.app/>

Features

- **User Authentication:** Users can register, log in, and manage their accounts securely.
- **Role-based Access Control:** The application supports two roles, admin and staff member, with different levels of access and functionality.
- **Ticket Management:** Staff members can create, update, and view tickets they have raised for hardware or software faults.
- **Admin Functionality:** Administrators can view all open tickets raised by staff members, close or delete tickets, and manage the overall fault reporting process.
- **Secure Implementation:** The application follows best practices and defends against common web vulnerabilities, such as some listed in the OWASP Top 10.

## Getting Started

### Prerequisites

- [Node.js][node] (v16 or later)
- npm (Node Package Manager) - Other package managers such as Yarn or Pnpm can also be used.

### Installation

1) Clone this repository with:

    ```terminal
    git clone https://github.com/WORTI3/uni-app-project-v2.git
    ```

2) Navigate to the `/uni-app-project-v2` directory
3) Install the projects dependencies:

    ```terminal
    npm i
    ```

    **Note:** To run locally you will need to create the file: `.env` and set the following secrets:

    ```bash
        SESSION_SECRET='YourSecretString'
    ```

4) Run the application:

    ```terminal
    npm run start:dev
    ```

5) You can then navigate to the following url in your browser to access the locally hosted application:

    <http://localhost:4000>

### Testing

To run the unit tests, use the following command:

```terminal
npm test:coverage
```

You can update the test snapshots by running:

```terminal
npm test -- -u
```

### Using the application

To make sure the app meets requirements outlined in the assignment / report. Two sample users and data has been populated into the database. You can also register an account but it's recommended **not** to use any personal information.

To view the app as an admin login with the below credentials:

```yaml
username: admin
password: admin
```

Alternatively, you can create an account as a normal user or login with the pre-defined user credentials:

```yaml
username: user
password: user
```

### Technologies used

- [Express][express] Web application framework for Node.js
- [Node][node] A JavaScript runtime environment
- [Jest][jest] A testing framework
- [Nunjucks][njk] Templating engine
- [TailwindCSS][tailwindcss] Utility-first CSS framework
- [Passport][passport] Authentication middleware for Node.js
- [SQLite3][sqlite] Embedded SQL database engine
- [Typescript][typescript] Superset of JavaScript with static typing

### NPM dependencies

- [nodemon][nodemon]
- [postcss][postcss]
- [sqlite3][sqlite]
- [luxon][luxon]
- [express-session][express-session]
- [csurf][csurf]
- [autoprefixer][autoprefixer]
- [express-validator][express-validator]
- [cheerio][cheerio]
- [supertest][supertest]

## Disclaimer

> ⚠️  If you're looking to use this code please be aware that this is a simple app made to satisfy the requirements provided by the assignment brief of my uni module. Thus, this code shouldn't be used for anything outside this scope.

## License

Released under the [unlicensed license][license]. As stated by the license, anyone is free to copy, modify, publish, use, compile, sell or distribute this software. If you use any part of the code please include credit to the author ([wortie][wortie-profile]).

<!-- Links -->
[express]: <https://expressjs.com>
[node]: <https://nodejs.org/en/>
[jest]: <https://jestjs.io>
[njk]: <https://mozilla.github.io/nunjucks/>
[tailwindcss]: <https://tailwindcss.com>
[passport]: <https://www.passportjs.org>
[sqlite]: <https://www.sqlite.org/index.html>
[typescript]: <https://www.typescriptlang.org/>

[nodemon]: <https://www.npmjs.com/package/nodemon>
[postcss]: <https://www.npmjs.com/package/postcss>
[luxon]: <https://www.npmjs.com/package/luxon>
[express-session]: <https://www.npmjs.com/package/express-session>
[csurf]: <https://www.npmjs.com/package/csurf>
[autoprefixer]: <https://www.npmjs.com/package/autoprefixer>
[express-validator]: <https://www.npmjs.com/package/express-validator>
[cheerio]: <https://www.npmjs.com/package/cheerio>
[supertest]: <https://www.npmjs.com/package/supertest>

[license]: <https://github.com/WORTI3/uni-app-project-v2/blob/main/LICENSE>
[wortie-profile]: <https://github.com/WORTI3>
