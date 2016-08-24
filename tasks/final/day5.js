'use strict'

var koa = require('koa')
var xss = require('xss')
var request = require('koa-request')

var app = koa()

function *searchMovies(q) {
  var options = {
    url: 'https://api.douban.com/v2/movie/search?q='
  }

  options.url += encodeURIComponent(q)

  var response = yield request(options)
  var data = JSON.parse(response.body)
  var subjects = []
  var movies = []

  if (data && data.subjects) {
    subjects = data.subjects
  }

  console.log('共找到 ' + subjects.length + ' 部电影')

  return subjects
}

app.use(function *() {
  var movie = this.query.movie
  var snippet1 = '<!DOCTYPE html><html><head><title>回声机</title></head><body>'
  var snippet2 = '</span></body></html>'
  var body = ''


  if (!movie) {
    body = '哔哔哔！得有个电影名字啊！'
  }
  else {
    movie = xss(movie)

    var movies = yield searchMovies(movie)
    var snippet = []

    movies.forEach(function(item) {
      snippet.push(
        '<div style="display: inline-block;">' +
          '<p><span style="color: #f60">' + item.year + '</span> ' + item.title + '</p>' +
          '<p><img src="' + item.images.large + '" /></p>' +
        '</div>'
      )
    })

    body = snippet.join('')
  }

  // 对输入的内容做一些必要的安全过滤
  this.body = snippet1 + body + snippet2
})

app.listen(3000)

console.log('成功启动服务，端口是 3000')

