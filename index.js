let comments = []

function createDiv(classList){
  const div = document.createElement('div')
  div.classList = classList ?? ''
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

function render(commentData, renderImmediately){
  const comment = createComment()
  
  const commentMain = createDiv('comment-main')
  const reply = createDiv()
  reply.id = `reply-${commentData.id}`

  const commentMainPoints = createCommentMainPoints(commentData.score)
  const commentMainContent = createDiv('comment-main-content')

  const commentMainContentHeader = createDiv('comment-main-content-header')
  const commentMainContentText = createDiv('comment-main-content-text')
  commentMainContentText.textContent = commentData.content

  const commentInfoUser = createDiv('comment-info-user')
  const imgReply = createImg('./images/icon-reply.svg', 'reply')
  const replyText = createText('Reply')

  const imgUser = createImg(commentData.user.image.png)
  const userName = createText(commentData.user.username)
  userName.classList = 'comment-info-user-name'
  const elapseTime = createText(commentData.createdAt)

  commentInfoUser.append(imgUser,userName,elapseTime)
  commentMainContentHeader.append(commentInfoUser,imgReply,replyText)
  commentMainContent.append(commentMainContentHeader,commentMainContentText)
  commentMain.append(commentMainPoints,commentMainContent)

  console.log(commentData.replies)
  if(commentData.replies){
    const repliesArray = commentData.replies.forEach(replie => render(replie,false))
  }
  comment.append(commentMain,reply)

  if(renderImmediately){
    document.querySelector('#comments').append(comment)
  }
  return comment
}

async function setup(){
  const results = await requestHttp()
  comments.push(...results)
  comments.forEach(comment => render(comment, true))
}

setup()