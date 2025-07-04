
const asynHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {

        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}


// const asynHandler = (fn) => (req, res, next) => {
//     return
//     Promise
//         .resolve(fn(req.res.next))
//         .catch((error) => {
//             success: false,
//                 message: error.message
//         })


}






