[![NPM version](https://badge.fury.io/js/trinte-creator.png)](http://badge.fury.io/js/trinte-creator)
## Script Creation module

Script creator for [TrinteJS](https://github.com/biggora/trinte) Javascript MVC Framework.
TrinteJS is a MVC boilerplate for ExpressJS backed by [CaminteJS ORM](https://github.com/biggora/caminte) and Bootstrap.

### Installation
First install required dependencies:

      $ sudo npm install bower mocha gulp npm -g

after install framework:

      $ npm install trinte -g
    
### Get started!

      $ trinte -i HelloWorld --sess   # Create application
      $ cd HelloWorld && npm install  # intall dependencies

      # generate scaffold
      $ trinte -g crud User active:bool name email password about:text created:date

  - Browse your application to [http://localhost:3000](http://localhost:3000)

Full params list [here](https://github.com/biggora/trinte/wiki/Create-App)

### Table of contents
* [Get started!](#create-app)
* [Usage overview](https://github.com/biggora/trinte/wiki/Command-format)
  * [Command format](https://github.com/biggora/trinte/wiki/Command-format)
  * [Create and initialize app](https://github.com/biggora/trinte/wiki/Create-App)
  * [Creates a Scaffold](https://github.com/biggora/trinte/wiki/Create-a-Scaffold)
  * [Creates a Model](https://github.com/biggora/trinte/wiki/Create-a-Model)
  * [Creates a Controller](https://github.com/biggora/trinte/wiki/Create-a-controller)
  * [Creates a View](https://github.com/biggora/trinte/wiki/Create-a-View)
  * [Creates a Rest](https://github.com/biggora/trinte/wiki/Create-a-Rest)
  * [Field types](https://github.com/biggora/trinte/wiki/Create-a-Model#field-types)
  * [Runs server](https://github.com/biggora/trinte/wiki/Runs-Server)
* [Created application](https://github.com/biggora/trinte/wiki/Application-configuration)
  * [Application configuration](https://github.com/biggora/trinte/wiki/Application-configuration)
  * [Database configuration](https://github.com/biggora/trinte/wiki/Application-configuration#database-configuration)
  * [Directory structure](https://github.com/biggora/trinte/wiki/Directory-Structure)
  * [Routing](https://github.com/biggora/trinte/wiki/Routes)
  * [Param pre-condition functions](https://github.com/biggora/trinte/wiki/Routes#wiki-param-pre-condition-functions)
  * [Middleware](https://github.com/biggora/trinte/wiki/Middleware)
  * [Application Helper](https://github.com/biggora/trinte/wiki/Helpers)
  * [Views Helper](https://github.com/biggora/trinte/wiki/Helpers#views-helper)
  * [Models Helper](https://github.com/biggora/trinte/wiki/Helpers#models-helper)
* [Examples](https://github.com/biggora/trinte/wiki/Examples)
  * [Database configuration](https://github.com/biggora/trinte/wiki/Examples#database-configuration)
  * [Authentication](https://github.com/biggora/trinte/wiki/Examples#authentication)
  * [Session](https://github.com/biggora/trinte/wiki/Examples#session)
  * [Multilingual support](https://github.com/biggora/trinte/wiki/Multilingual-support)

### Copyright & License

    (The MIT License)

    Copyright (c) 2013-2014 Alexey Gordeyev

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

### Resources

- Visit the [author website](http://www.gordejev.lv).
- Follow [@biggora](https://twitter.com/#!/biggora) on Twitter for updates.
- Follow [agbiggora](https://www.facebook.com/agbiggora) on Facebook for updates.
- Report issues on the [github issues](https://github.com/biggora/trinte-creator/issues) page.

### Recommend extensions

- [CaminteJS](http://www.camintejs.com/) - Cross-db ORM for NodeJS
- [2CO](https://github.com/biggora/2co) - is the module that will provide nodejs adapters for 2checkout API payment gateway.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/biggora/trinte-creator/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

