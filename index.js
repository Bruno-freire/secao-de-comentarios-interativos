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

function render(commentData, isReply){
  const comment = createComment()
  
  const commentMain = createDiv('comment-main')
  const reply = createDiv('reply')
  reply.id = `reply-${commentData.id}`

  const commentMainPoints = createCommentMainPoints(commentData.score)
  const commentMainContent = createDiv('comment-main-content')

  const commentMainContentHeader = createDiv('comment-main-content-header')
  const commentMainContentText = createDiv('comment-main-content-text')
  commentMainContentText.textContent = commentData.content

  const commentInfoUser = createDiv('comment-info-user')
  const div = createDiv('comment-info-reply')
  const imgReply = createImg('./images/icon-reply.svg', 'reply')
  const replyText = createText('Reply')
  div.append(imgReply,replyText)

  const imgUser = createImg(commentData.user.image.png)
  const userName = createText(commentData.user.username)
  userName.classList = 'comment-info-user-name'
  const elapseTime = createText(commentData.createdAt)

  commentInfoUser.append(imgUser,userName,elapseTime)
  commentMainContentHeader.append(commentInfoUser,div)
  commentMainContent.append(commentMainContentHeader,commentMainContentText)
  commentMain.append(commentMainPoints,commentMainContent)

  if(commentData.replies){
      commentData.replies.forEach(replie => {
        const replieRenderizado = render(replie)
        replieRenderizado.classList.add('replyComment')
        reply.append(replieRenderizado)
      })
  }

  comment.append(commentMain,reply)
  
  return comment
}

async function setup(){
  const results = await requestHttp()
  comments.push(...results)
  comments.forEach(comment => {
    const renderedComment = render(comment)
    document.querySelector('#comments').append(renderedComment)
  })
}

setup()