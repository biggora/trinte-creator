###
Simple pager - couldn't find one for Express that worked for me.
###

# Remember how many we have

# result += "<li style='margin-left:10px;'>&nbsp;Go To: <input id='pagerGoto' type='text' name='skip' value='' class='input-mini pager-page' title='Go to a specific start point, type and enter ...' /></li>";
pageLink = (path, skip, limit, page) ->
  "<li><a href='" + path + "/" + skip + "-" + limit + "'>" + page + "</a></li>"
pageSpan = (page, cur) ->
  cssclass = (if (cur) then "active" else "disabled")
  "<li class=\"" + cssclass + "\"><a href=\"#\">" + page + "</a></li>"
exports.version = "0.0.1"
exports.render = (skip, limit, total, path) ->
  totalPages = Math.ceil(total / limit) + 1
  currentPage = skip / limit + 1
  result = ""
  start = undefined
  finish = undefined
  selectedClass = "page-selected"
  visiblePages = 5
  totalPageLinks = 0
  result += pageSpan(currentPage, true)
  additionalForward = (if currentPage < visiblePages then visiblePages - currentPage else 0)
  i = currentPage + 1
  while (i < currentPage + visiblePages + additionalForward) and (i < totalPages)
    start = (i - 1) * limit + 1
    result += pageLink(path, start, limit, i)
    i++
  if currentPage < totalPages - 1
    result += pageLink(path, skip + limit + 1, limit, ">")
    lastPageStart = (totalPages - 2) * limit + 1
    result += pageLink(path, lastPageStart, limit, ">>")
  additionalBackward = (if (totalPages - currentPage) < visiblePages then visiblePages - (totalPages - currentPage) else 0)
  i = currentPage - 1
  while (i > currentPage - visiblePages - additionalBackward) and (i > 0)
    start = (i - 1) * limit + 1
    result = pageLink(path, start, limit, i) + result
    i--
  if currentPage > 1
    result = pageLink(path, (skip - limit + 1), limit, "<") + result
    result = pageLink(path, 1, limit, "<<") + result
  result += "</ul>"
  result += "<span class='pull-right' style='font-size:14px;margin-top:5px'>" + (skip + 1) + " to " + (skip + limit) + " of " + (total) + "</span>"
  "<div><ul class='pagination'>" + result + "</div>"
