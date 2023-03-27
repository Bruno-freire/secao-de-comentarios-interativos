  const express = require('express');
  const bodyParser = require('body-parser');
  const jsonServer = require('json-server');

  const server = jsonServer.create();
  const router = jsonServer.router('./data.json');
  const middlewares = jsonServer.defaults();

  server.use(middlewares);
  server.use(bodyParser.json());

  // get all comments
  server.get('/comments', (req, res) => {
    const comments = router.db.get('comments').value();
    res.json(comments);
  });

  // get comment by id
  server.get('/comments/:id', (req, res) => {
    const comment = router.db
      .get('comments')
      .find({ id: parseInt(req.params.id) })
      .value();

    if (comment) {
      res.json(comment);
    } else {
      res.status(404).json({ message: 'Comment not found' });
    }
  });

  // create new comment
  server.post('/comments', (req, res) => {
    const newComment = req.body;
    newComment.id = Date.now();
    newComment.createdAt = new Date().toISOString();
    newComment.score = 0;
    router.db.get('comments').push(newComment).write();
    res.json(newComment);
  });

  // update comment by id
  server.put('/comments/:id', (req, res) => {
    const updatedComment = req.body;
    updatedComment.id = parseInt(req.params.id);
    updatedComment.user = router.db
      .get('comments')
      .find({ id: parseInt(req.params.id) })
      .get('user')
      .value();
    updatedComment.createdAt = router.db
      .get('comments')
      .find({ id: parseInt(req.params.id) })
      .get('createdAt')
      .value();
    updatedComment.replies = router.db
      .get('comments')
      .find({ id: parseInt(req.params.id) })
      .get('replies')
      .value();
    router.db
      .get('comments')
      .find({ id: parseInt(req.params.id) })
      .assign(updatedComment)
      .write();
    res.json(updatedComment);
  });

  // delete comment by id
  server.delete('/comments/:id', (req, res) => {
    const comment = router.db
      .get('comments')
      .find({ id: parseInt(req.params.id) })
      .value();

    if (comment) {
      router.db.get('comments').remove({ id: parseInt(req.params.id) }).write();
      res.sendStatus(204);
    } else {
      res.status(404).json({ message: 'Comment not found' });
    }
  });

  // GET replies de um comentário específico
  server.get("/comments/:id/replies", (req, res) => {
    const commentId = parseInt(req.params.id);
    const comment = router.db.get('comments').find((comment) => comment.id === commentId).value();

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
    } else {
      res.json(comment.replies);
    }
  });

  // POST reply para um comentário específico
  server.post("/comments/:id/replies", (req, res) => {
    const commentId = parseInt(req.params.id);
    const comment = router.db.get('comments').find((comment) => comment.id === commentId).value();

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
    } else {
      const { content, user } = req.body;
      const newReply = {
        id: comment.replies.length + 1,
        content,
        createdAt: new Date().toISOString(),
        score: 0,
        user,
        replies: [],
      };
      comment.replies.push(newReply);
      res.json(newReply);
    }
  });

  // GET reply de um comentário específico
  server.get('/comments/:commentId/replies/:replyId', (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const replyId = parseInt(req.params.replyId);

    const comment = router.db
      .get('comments')
      .find({ id: commentId })
      .value();

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
    } else {
      const reply = comment.replies.find((r) => r.id === replyId);
      if (!reply) {
        res.status(404).json({ error: 'Reply not found' });
      } else {
        res.json(reply);
      }
    }
  });


  // PUT para atualizar um reply específico de um comentário específico
  server.put("/comments/:commentId/replies/:replyId", (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const replyId = parseInt(req.params.replyId);
    const comment = router.db.get('comments').find((comment) => comment.id === commentId);
    
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
    } else {
      const reply = comment.replies.find((reply) => reply.id === replyId);
  
      if (!reply) {
        res.status(404).json({ error: "Reply not found" });
      } else {
        const { content } = req.body;
        reply.content = content;
        res.json(reply);
      }
    }
  });

  // DELETE para deletar um reply específico de um comentário específico
  server.delete("/comments/:commentId/replies/:replyId", (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const replyId = parseInt(req.params.replyId);
    const comment = router.db.get('comments').find((comment) => comment.id === commentId).value();

    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
    } else {
      const replyIndex = comment.replies.findIndex((reply) => reply.id === replyId);

      if (replyIndex === -1) {
        res.status(404).json({ error: "Reply not found" });
      } else {
        router.db.get('comments').find({ id: commentId }).get('replies').remove({ id: replyId }).write();
        res.status(204).send();
      }
    }
  });

  server.listen(8080, () => {
    console.log('JSON Server is running');
  });
