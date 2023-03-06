

let comments = []

function createDiv(classList){
  const div = document.createElement('div')
  div.classList = classList || ''
  return div
}

function createComment(){
  const comment = document.createElement('div')
  comment.classList = 'comment'
  return comment
}

function createText(textContent){
  const text = document.createElement('p')
  text.textContent = textContent
  return text
}

function createCommentMainPoints(value){
  const commentMainPoints = createDiv('comment-main-points')

  const imgPlus = createImg('./images/icon-plus.svg', 'plus')
  const valueLikeComment = createText(value)
  const imgMinus = createImg('./images/icon-minus.svg', 'minus')
  commentMainPoints.append(imgPlus,valueLikeComment,imgMinus)
  return commentMainPoints
}


function createImg(src,alt){
  const img = document.createElement('img')
  img.src = src
  img.alt = alt
  return img
}

async function requestHttp(){
  return await fetch('http://localhost:3000/comments').then(res => res.json())
}

function render(commentData){
  const comment = createComment()
  const reply = createDiv()
  reply.id = `reply-${commentData.id}`

  const commentMain = createCommentMain(commentData.content)
  const commentMainPoints = createCommentMainPoints(commentData.score)
  const commentMainContent = createCommentMainContent('comment-main-content')


  commentMain.append(commentMainPoints,commentMainContent)
  comment.append(commentMain,reply)
  return comment
}

async function setup(){
  const results = await requestHttp()
  console.log(results)
}

setup()