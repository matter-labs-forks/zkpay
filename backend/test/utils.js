require("dotenv").config()
const {ethers} = require("ethers")
const sigUtil = require("eth-sig-util")
const supertest = require("supertest")
const app = require("../src")

const request = (exports.request = supertest(app))

exports.account = async function () {
  const user = new User()
  await user.init()
  return user
}

class User {
  async init() {
    this.wallet = ethers.Wallet.createRandom()
    this.address = await this.wallet.getAddress()
    await this.auth()
  }

  async auth() {
    // get challenge
    const challenge = (
      await request.get(`/auth/1/${this.address.toLowerCase()}`).expect(200)
    ).body
    // console.log({challenge})

    // sign
    // const signature = await wallet._signTypedData(
    //   challenge.domain,
    //   [challenge.types.Challenge],
    //   challenge.message
    // )
    const pk = Buffer.from(this.wallet.privateKey.replace("0x", ""), "hex")
    const signature = sigUtil.signTypedData_v4(pk, {data: challenge})
    // console.log({signature})

    // verify
    this.token = (
      await request
        .get(`/auth/1/${challenge.message.challenge}/${signature}`)
        .expect(200)
    ).body
  }
}
