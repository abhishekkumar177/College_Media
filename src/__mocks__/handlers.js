import { rest } from 'msw';

export const handlers = [
  rest.get('/api/posts', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          user: { username: 'testuser' },
          caption: 'Mocked post',
          likes: 10
        }
      ])
    );
  }),

  rest.post('/api/posts/:id/like', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({ success: true, likes: 11 })
    );
  })
];
