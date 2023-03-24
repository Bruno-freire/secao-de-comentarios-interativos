let comments = []

function elapsedTime(timestamp) {
  const millisecondsPerSecond = 1000;
  const millisecondsPerMinute = millisecondsPerSecond * 60;
  const millisecondsPerHour = millisecondsPerMinute * 60;
  const millisecondsPerDay = millisecondsPerHour * 24;
  const millisecondsPerWeek = millisecondsPerDay * 7;
  const millisecondsPerMonth = millisecondsPerDay * 30;

  const now = Date.now();
  const difference = now - timestamp;

  if (difference < millisecondsPerMinute) {
    return 'Agora mesmo';
  } else if (difference < millisecondsPerHour) {
    const minutes = Math.floor(difference / millisecondsPerMinute);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
  } else if (difference < millisecondsPerDay) {
    const hours = Math.floor(difference / millisecondsPerHour);
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
  } else if (difference < millisecondsPerWeek) {
    const days = Math.floor(difference / millisecondsPerDay);
    return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
  } else if (difference < millisecondsPerMonth) {
    const weeks = Math.floor(difference / millisecondsPerWeek);
    return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
  } else {
    const months = Math.floor(difference / millisecondsPerMonth);
    return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
  }
}

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

async function requestHttp(url){
  return await fetch(`http://localhost:3000/${url}`).then(res => res.json())
}

async function findComment(id){
  const comments = await requestHttp('comments')
  comments.forEach(comment => {
    if(comment.replies){
      comment.replies.forEach(replie => {
        if(replie.id === id){
          return replie
        }
      })
    }else{

    }
  })
}

async function deleteComment(commentData) {
  //verifica se é uma resposta
  if (commentData.replyingTo) {
    const comments = [...await requestHttp('comments')]
    comments.forEach(comment => {
      if (comment.replies.length !== 0) {
        const commentId = comment.id
        const index = comment.replies.findIndex(reply => reply.id === commentData.id);
        if (index !== -1) {
          comment.replies.splice(index, 1);
          fetch(`http://localhost:3000/comments/${commentId}`, {
          method: 'PUT', 
          body: JSON.stringify(comment),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        }else{
          comment.replies.forEach((reply,indexCurrentReply) => {
            reply.replies.map((answerOfTheAnswer,indexCurrentAnswerOfTheAnswer) => {
              if(answerOfTheAnswer.id == commentData.id){
                comment.replies[indexCurrentReply].replies.splice(indexCurrentAnswerOfTheAnswer,1)
                fetch(`http://localhost:3000/comments/${commentId}`, {
                  method: 'PUT', 
                  body: JSON.stringify(comment),
                  headers: {
                    'Content-Type': 'application/json'
                  }
                })
              }
            })
          })
        }
      }
    })
  } else {
    await fetch(`http://localhost:3000/comments/${commentData.id}`, {
      method: 'DELETE'
    })
  }
}

function renderInputCurrentUser() {
  return `
    <div class="inputCurrentUser">
      <img id="currentUserImg" src="./images/avatars/image-juliusomo.png" alt="userMain" />
      <textarea
        id="textContent"
        maxlength="120"
        style="resize: none"
        placeholder="Add comment..."
      ></textarea>
      <button class="replyBtn">Reply</button>
    </div>
  `;
}

function generateRandomId() {
  const characters = '0123456789';
  const length = 8; // Altere o comprimento do ID, se necessário
  let id = '';
  for (let i = 0; i < length; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return parseInt(id)
}

async function replyButton(button){
  const id = parseInt(button.parentNode.parentNode.id.charAt(button.parentNode.parentNode.id.length - 1))
  const nameReply = button.parentNode.parentNode.parentNode.querySelector(".comment-info-user-name").textContent
  const comments = await requestHttp('comments')
  const img = button.parentNode.querySelector('#currentUserImg').src
  const content = button.parentNode.querySelector('textarea').value
  const regex = /^\S.*\S$/
  const notVoid = regex.test(content);
  if(!notVoid){
    alert('Não é possivel enviar uma mensagem vazia');
    return;
  }
  const createdAt = new Date()
  comments.map(comment => {
    if(comment.id === id){
      comment.replies.push({user: {image: {png: img},username: 'juliusomo'},content,createdAt,score: 0, currentUser: true, replies: [], id: generateRandomId(),replyingTo: nameReply})
      fetch(`http://localhost:3000/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
      })
      return;
    }else{
      if(comment.replies){
        comment.replies.map(reply => {
          if(reply.id == id){
            reply.replies.push({user: {image: {png: img},username: 'juliusomo'},content,createdAt,score: 0, currentUser: true, replies: [], id: generateRandomId(),replyingTo: nameReply})
            fetch(`http://localhost:3000/comments/${comment.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(comment)
            })
          }
        })
      }
    }
  })
}

function addReplyButtonClickEvent() {
  const replyButtons = document.querySelectorAll('.replyBtn');
  replyButtons.forEach(button => {
    button.addEventListener('click', () => {
      replyButton(button)
    })
  });
}

function Reply(){
  const reply = this.parentNode.parentNode.parentNode.parentNode.querySelector('.reply')
  if(reply.innerHTML !== ''){
    if(reply.querySelector('.inputCurrentUser')){
      reply.querySelector('#textContent').focus()
      return
    }
    reply.insertAdjacentHTML("beforeend", renderInputCurrentUser());
    reply.querySelector('#textContent').focus()
    reply.querySelector('#textContent').addEventListener('blur', () => {
      if(reply.querySelector('#textContent').value == ''){
        reply.querySelector('.inputCurrentUser').remove()
      }
    })
    addReplyButtonClickEvent()
  }else{
    reply.innerHTML = renderInputCurrentUser()
    reply.querySelector('#textContent').focus()
    reply.querySelector('#textContent').addEventListener('blur', () => {
      if(reply.querySelector('#textContent').value == ''){
        reply.querySelector('.inputCurrentUser').remove()
      }
    })
    addReplyButtonClickEvent()
  }
    const newParagraph = reply.lastElementChild;
    if (newParagraph.offsetTop > window.scrollY + window.innerHeight) {
      newParagraph.scrollIntoView({ behavior: 'smooth' });
    }
}

function render(commentData){
  if(commentData == null){
    return
  }
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
  const commentInfoReply = createDiv('comment-info-reply')

  if(commentData.currentUser){
    const deleteDiv = createDiv("deleteDiv")
    const deleteImg = createImg('./images/icon-delete.svg')
    const deleteTxt = createText('Delete')
    deleteDiv.append(deleteImg,deleteTxt)
    deleteDiv.addEventListener('click', () => deleteComment(commentData))

    const editDiv = createDiv("editDiv")
    const editImg = createImg('./images/icon-edit.svg')
    const editTxt = createText('Edit')
    editDiv.append(editImg,editTxt)
    
    commentInfoReply.append(deleteDiv,editDiv)
  }else{
    const imgReply = createImg('./images/icon-reply.svg', 'reply')
    const replyText = createText('Reply')
    commentInfoReply.append(imgReply,replyText)
    commentInfoReply.addEventListener('click', Reply)
  }

  const imgUser = createImg(commentData.user.image.png)
  const userName = createText(commentData.user.username)
  userName.classList = 'comment-info-user-name'
  const elapseTime = createText(elapsedTime(Date.parse(commentData.createdAt)))
  commentInfoUser.append(imgUser,userName,elapseTime)
  commentMainContentHeader.append(commentInfoUser,commentInfoReply)
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
  const results = await requestHttp('comments')
  const results2 = [...results]
  comments.push(...results2)
  comments.forEach(comment => {
    const renderedComment = render(comment)
    document.querySelector('#comments').append(renderedComment)
  })
}

setup()

async function send(){
  const img = document.querySelector('#currentUserImg').src
  const content = document.querySelector('textarea').value

  const regex = /^\S.*\S$/
  const notVoid = regex.test(content);
  if(!notVoid){
    alert('Não é possivel enviar uma mensagem vazia');
    return;
  }
  const createdAt = new Date()
  await fetch('http://localhost:3000/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({user: {image: {png: img},username: 'juliusomo'},content,createdAt,score: 0, currentUser: true, replies: []})
  })
}

document.querySelector('.send').addEventListener('click', send)