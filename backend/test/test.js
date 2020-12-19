const assert = require('assert')
const {account, request} = require('./utils')

describe('api', function () {
  it('auths', async function () {
    const user = await account()
    assert(user.token)
  })

  it('puts links', async function () {
    const linkId = Date.now().toString()
    const ipfsId = 'ipfs'

    await request.put('/links').send({id: linkId, ipfsId}).expect(403)

    const user1 = await account()
    const user2 = await account()

    await request
      .put('/links')
      .set({Authorization: `Bearer ${user1.token}`})
      .send({id: linkId, ipfsId})
      .expect(200)

    await request
      .put('/links')
      .set({Authorization: `Bearer ${user2.token}`})
      .send({id: linkId, ipfsId})
      .expect(403)
  })

  it('gets a link', async function () {
    const user = await account()

    const linkId = Date.now().toString()
    const ipfsId = 'ipfs'

    await request
      .put('/links')
      .set({Authorization: `Bearer ${user.token}`})
      .send({id: linkId, ipfsId})
      .expect(200)

    await request
      .get(`/links/${linkId}`)
      .expect(200)
      .expect(JSON.stringify(ipfsId))
  })

  it('gets an address links', async function () {
    await request.get('/links').expect(403)

    const user1 = await account()
    const user2 = await account()

    const link1Id = Date.now().toString()
    const ipfs1Id = 'ipfs1'
    const link2Id = link1Id + '2'
    const ipfs2Id = ipfs1Id + '2'

    await request
      .put('/links')
      .set({Authorization: `Bearer ${user1.token}`})
      .send({id: link1Id, ipfsId: ipfs1Id})
      .expect(200)

    await request
      .put('/links')
      .set({Authorization: `Bearer ${user2.token}`})
      .send({id: link2Id, ipfsId: ipfs2Id})
      .expect(200)

    await request
      .get('/links')
      .set({Authorization: `Bearer ${user1.token}`})
      .expect(200)
      .expect(JSON.stringify([link1Id]))

    await request
      .get('/links')
      .set({Authorization: `Bearer ${user2.token}`})
      .expect(200)
      .expect(JSON.stringify([link2Id]))
  })

  it('removes links', async function () {
    const user = await account()

    const linkId = Date.now().toString()
    const ipfsId = 'ipfs'

    await request
      .put('/links')
      .set({Authorization: `Bearer ${user.token}`})
      .send({id: linkId, ipfsId})
      .expect(200)

    await request
      .get(`/links/${linkId}`)
      .expect(200)
      .expect(JSON.stringify(ipfsId))

    await request
      .put('/links')
      .set({Authorization: `Bearer ${user.token}`})
      .send({id: linkId, ipfsId: null})
      .expect(200)

    await request.get(`/links/${linkId}`).expect(404)
  })
})
