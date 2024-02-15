# uni-app-project <img style="float: right; padding: 10px;" src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FWORTI31212%2Funi-app-project-v2&count_bg=%23005CB8&title_bg=%23555555&icon=&icon_color=%23EB0000&title=VIEWS&edge_flat=false">

"Faultifier" - a simple [Express][express] App written for Software Engineering and Devops university module.

Deployed site can be found in the right side nav -->

<details>
<summary>In-Depth Description:</summary>
"Faultifier" is an express application that provides a simple system for authenticating users (using passport) based on their roles as an admin or staff member. The system allows staff members to log hardware or software faults with company equipment by creating a ticket, updating the ticket, and viewing all their raised tickets. Admin users have additional functionality, such as closing and deleting tickets, as well as viewing all open tickets for every member of staff. This allows admin users to assess the raised tickets more efficiently. The system ensures that only authorised users can access the appropriate functionality based on their role, making "Faultifier" a secure and easy-to-use application for fault reporting and management.
</details>

## Running the application

1) Clone this repository with:

    ```terminal
    git clone https://github.com/WORTI3/uni-app-project-v2.git
    ```

2) Navigate to the `/uni-app-project-v2` directory
3) Install the projects dependencies:

    ```terminal
    npm i
    ```

4) Run the application:

    ```terminal
    npm run start:dev
    ```

## Using the application

To make sure the app meets requirements outlined in the assignment / report. Two example users as well as some example data has been populated into the database. You can also register an account but it's recommended **not** to use any personal information.
To view the app as an admin login with the below credentials:

```yaml
username: admin
password: admin
```

Alternatively, you can create an account as a normal user or login as a normal user, using the following credentials:

```yaml
username: user
password: user
```

## Testing the application

You can run all of the current unit tests through the following command:

```terminal
npm run test
```

To update the test snapshots run the following:

```terminal
npm run test -- -u
```

### Softwares used

- [Express][express]
- [Node][node]
- [Jest][jest]
- [Nunjucks][njk]
- [TailwindCSS][tailwindcss]
- [Passport][passport]
- [SQLite3][sqlite]
- Typescript

### NPM dependencies:

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
