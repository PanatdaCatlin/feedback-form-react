const feedback = async ctx => {
  const { subject, message, type } = ctx.request.body;
  ctx.assert(
    ctx.state.user.id,
    502,
    "User ID Missing - This is an Internal Error"
  );
  ctx.assert(subject, 400, "Subject Missing");
  ctx.assert(message, 400, "Message Missing");
  ctx.assert(type, 400, "Type Missing");
  try {
    // Destructure ctx.state.body for DRY code
    const feedback = await ctx.db.knex("feedback").insert({
      user_id: ctx.state.user.id,
      subject,
      message,
      type
    });
    if (feedback.rowCount !== 1) {
      throw 500;
    }
  } catch (e) {
    ctx.throw(500, e);
  }
  ctx.ok();
};

module.exports = {
  feedback
};
