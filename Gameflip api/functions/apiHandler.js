const axios = require('axios')
const GfApi = require('gfapi')
const baseURL = 'https://production-gameflip.fingershock.com/api/v1'

async function connectToGf(key, secr) {
    try {
        const gfapi = new GfApi(key, {
            secret: secr,
            algorithm: "SHA1",
            digits: 6,
            period: 30
        }, {
            logLevel: 'info'
        });
        return gfapi
    }catch(e) {
        // console.log(e)
        return false
    }
}

async function getProfile(key, secret) {
    try {
        let gf = await connectToGf(key, secret)
        let profile = await gf.profile_get('')
        return profile
    }catch(e) {
        // console.log(e)
        return false
    }
}

async function getWallet(key, secret) {
    try {
        let gf = await connectToGf(key, secret)
        let wallet = await gf.wallet_get('')
        return wallet
    }catch(e) {
        return false
    }
}

async function getSales(key, secret, count) {
    try {
        query = {
            role: 'seller',
            status: GfApi.EXCHANGE_STATUS.COMPLETE,
            limit: count
        };
        let gf = await connectToGf(key, secret)
        let result = await gf.exchange_search(query);
        // console.log(result)
        return result
    }catch(e) {
        // console.log(e)
        return false
    }
}

async function postListing(key, secret, listingName, listingDescription , price , owner , image , shipDay ,expireDay , tags) {
    try {
        // console.log(tags)
        let listingTags = ["id : bundle",
            "type : custom"]
        if (tags) listingTags = tags
        let shipping_within_days = shipDay?shipDay: 3
        let expire_in_days = expireDay?expireDay: 7
        let query = {
            "kind": "item",
            "owner": owner,
            "status": "draft",
            "name": listingName,
            "description": listingDescription,
            "category": "DIGITAL_INGAME",
            "platform": "xbox_one",
            "upc": "GFXOFLLOUT76",
            "price": price*100,
            "accept_currency": "USD",
            "shipping_within_days": shipping_within_days,
            "expire_in_days": expire_in_days,
            "shipping_fee": 0,
            "shipping_paid_by": "seller",
            "shipping_predefined_package": 'None',
            "cognitodp_client": "marketplace",
            "tags": listingTags,
            "digital": true,
            "digital_region": "none",
            "digital_deliverable": "transfer",
            "visibility": "public"
        }
        let gf = await connectToGf(key, secret)
        let result = await gf.listing_post(query);
        let listingId = result.id
        let postImage = await gf.upload_photo(listingId, image, 'active')
        postImage = await gf.upload_photo(listingId, image, 1)
        postImage = await gf.upload_photo(listingId, image)
        let statusChange = await gf.listing_status(listingId, 'onsale')
        return listingId
    }catch(e) {
        console.log(e)
        return false
    }
}

async function getListing(key , secret , id) {
    try {
        let gf = await connectToGf(key, secret)
        let result = await gf.listing_get(id)
        return result
    }catch(e) {
        return false
    }
}

async function getListings(key, secret, owner) {
    try {
        let query = {
            "owner": owner,
            "status": "onsale",
            "sort": "created",
            "visibility": "public",
            "limit": 100
        }
        let gf = await connectToGf(key, secret)
        let result = await gf.listing_search(query);
        return result
    }catch(e) {
        return false
    }
}

async function deleteListing(key, secret, id) {
    try {
        let gf = await connectToGf(key, secret, id)
        let result = await gf.listing_delete(id);
        console.log(`Successfully Deleted a Listing ${id}`)
        return result
    }catch(e) {
        console.log(e)
        return false
    }
}

module.exports = {
    connectToGf,
    getProfile,
    getWallet,
    getSales,
    postListing,
    getListings,
    deleteListing,
    getListing
}