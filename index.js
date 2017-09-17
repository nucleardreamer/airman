const { join } = require('path')
const walkSync = require('walk-sync')
const _ = require('lodash')
const oak = require('oak')
const pug = require('pug')
const url = require('url')
const { existsSync } = require('fs')
const qs = require('querystring')
const tools = require('oak-tools')
const express = require('express')
const stylus = require('stylus')

// this will throw errors when something goes wrong in the window
oak.catchErrors()

const app = express()

const logger = tools.logger({
  level: 'info',
  pretty: process.env.NODE_ENV !== 'production'
})

logger.info({
  msg: 'Airman Init'
})

let publicPath = join(__dirname, 'public')
let viewsPath = join(__dirname, 'views')

app.set('views', viewsPath)

app.set('view engine', 'pug')

app.use(stylus.middleware({
  src: viewsPath,
  dest: publicPath
}))

app.use(express.static(publicPath))

app.get('/', function (req, res) {
  res.render('index')
})

// for partial template renders
app.get('/tmpl/:name*', function ({ originalUrl }, res) {
  let orig = url.parse(originalUrl)
  let tmplPath = join(viewsPath, orig.pathname.replace('/tmpl/', '')) + '.pug'
  let query = qs.parse(orig.query)
  logger.debug('template render', {
    path: tmplPath
  })
  if (existsSync(tmplPath)) {
    res.send(pug.renderFile(tmplPath, query))
  } else {
    res.status(404).send('Template does not exist.')
  }
})

// get all JS files inside the views folder (nested), load them all with index.js at the start
const jsFiles = _.map(
  [
    'index.js',
    ...(
      walkSync(viewsPath, {
        globs: ['*/*.js']
      })
    )
  ], v => join(viewsPath, v)
)

logger.debug('client js files loaded', jsFiles)

let window = null

app.listen(process.env.PORT || 9999, function () {
  oak.on('ready', () => {
    loadWindow()
  })
})

function loadWindow () {
  window = oak.load({
    url: 'http://localhost:9999/',
    background: '#000000',
    sslExceptions: ['localhost'],
    scripts: [
      {
        name: 'lodash',
        path: 'lodash'
      },
      {
        name: 'uuid',
        path: 'uuid'
      },
      join(__dirname, 'node_modules', 'hammerjs'),
      join(__dirname, 'node_modules', 'angular'),
      join(__dirname, 'node_modules', 'angular-animate'),
      join(__dirname, 'node_modules', 'angular-hammer'),
      join(__dirname, 'node_modules', '@uirouter/angularjs'),
      ...jsFiles
    ]
  })
  .on('log.*', function (props) {
    logger[this.event.replace('log.', '')](props)
  })
  .on('unresponsive', function () {
    reloadIt('renderer unresponsive')
  })
  .on('crashed', function () {
    reloadIt('renderer unresponsive')
  })
}

function reloadIt (err) {
  let oldWindow = window
  logger.error(new Error(err))
  loadWindow()
  oldWindow.close()
}
