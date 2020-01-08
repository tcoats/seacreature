const diff = require('./diff')

module.exports = async (ctx) => {
  ctx.hub.on('change transactions', async (changes = []) => {
    for (const t of changes) {
      const [prev, now] = t
      if (now == null) await ctx.hub.emit('record operations', ctx.transactions.batch([
        { type: 'del', key: `${prev.batchid}/${prev.id}` }]))
      else {
        await ctx.hub.emit('record operations', ctx.transactions.batch([
          { type: 'put', key: `${now.batchid}/${now.id}`, value: now }]))
        if (prev && prev.ts != now.ts) await ctx.hub.emit('record operations', ctx.timeline.batch([
          { type: 'del', ts: prev.ts, batchid: prev.batchid, id: prev.id }]))
        await ctx.hub.emit('record operations', ctx.timeline.batch([
          { type: 'put', ts: now.ts, batchid: now.batchid, id: now.id, value: now }]))
      }
    }
    await ctx.hub.emit('commit operations')
    await ctx.hub.emit('transactions changed',
      await Promise.all(changes.map(async t => {
        const delta = diff.transaction(t[0], t[1])
        for (const d of delta)
          for (const dim of Object.keys(d.dimensions))
            for (const ancestor of ctx.hierarchy.ancestors(dim))
              d.dimensions[ancestor] = true
        return delta
      })))
  })
}
