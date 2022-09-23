require("dotenv").config();
const PushDeer = require("push-all-in-one").PushDeer;
const axios = require("axios").default;
// get logged in cookie
const cookie = process.env.COOKIE;
// make sure date sync with CST
const local_date_string = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Shanghai",
});
const local_date_obj = new Date(local_date_string);
const today = local_date_obj.getDate();
const pushdeer = new PushDeer(process.env.PUSH_DEER_KEY);
// const headers = {
//     accept: "application/json, text/plain, */*",
//     "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
//     "client-platform": "WEB-APP",
//     "content-type": "application/x-www-form-urlencoded",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-site",
//     "user-token": "null",
//     cookie: cookie,
//     Referer: "https://campaign.huazhu.com/",
//     "Referrer-Policy": "strict-origin-when-cross-origin",
// };

const sign = async () => {
    return new Promise((resolve, reject) => {
        fetch("https://hweb-mbf.huazhu.com/api/signIn", {
            headers: {
                accept: "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
                "client-platform": "WEB-APP",
                "content-type": "application/x-www-form-urlencoded",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "user-token": "null",
                cookie: cookie,
                Referer: "https://campaign.huazhu.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            },
            body: `state=1&day=${today}`,
            method: "POST",
        })
            .then((ret) => ret.json())
            .then((res) => {
                if (res.hasOwnProperty("error")) {
                    reject(res);
                } else {
                    const feedback = {
                        success: res.content.success,
                        point: res.content.point,
                        isSign: res.content.isSign,
                    };
                    resolve(feedback);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

(async () => {
    sign()
        .then(async (result) => {
            const successMsg = `
## [华住签到]:${result.success || result.isSign ? "成功" : "失败"}  
${local_date_string}  
积分：${result.point}    
    `;
            if (result.isSign === false) {
                console.log(successMsg);
                await pushdeer.send(successMsg, "markdown");
            } else {
                //already signed
                console.log(successMsg);
            }
        })
        .catch(async (err) => {
            let errMsg = JSON.stringify(err);
            if (err.error === "Unauthorized") {
                errMsg =
                    "Authorize failed. \n It's likely that the cookie has expired.";
            }
            const failMsg = `
## [华住签到]: 错误发生
log:
${errMsg}`;
            console.log(failMsg);
            await pushdeer.send(failMsg, "markdown");
            throw new Error(failMsg);
        });

    // TODO dunno why this won't work but will figure it out
    // axios
    //     .post(
    //         "https://hweb-mbf.huazhu.com/api/signIn",
    //         {
    //             state: 1,
    //             day: 12,
    //         },
    //         {
    //             headers: {
    //                     accept: "application/json, text/plain, */*",
    //                     "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    //                     "client-platform": "WEB-APP",
    //                     "content-type": "application/x-www-form-urlencoded",
    //                     "sec-fetch-dest": "empty",
    //                     "sec-fetch-mode": "cors",
    //                     "sec-fetch-site": "same-site",
    //                     "user-token": "null",
    //                     cookie: cookie,
    //                     Referer: "https://campaign.huazhu.com/",
    //                     "Referrer-Policy": "strict-origin-when-cross-origin",
    //             },
    //         }
    //     )
    //     .then((res) => {
    //         console.log(res.status);
    //         console.log(res.data);
    //     });
    return;
})();

/*
                payload: state=1&day=11
                response:
                    content: {
                        count: null,
                        deductionPoint: null,
                        isSign: true,
                        isSupplement: false,
                        luckyDrawInfo: null,
                        msg: '',
                        now: 0,
                        point: null,
                        signInSendPoint: 0,
                        signInToTeamEcoupon: 0,
                        success: false,
                        time: '',
                        toAppObj: { id: null, point: null, state: null },
                        type: 2
                    },
                    message: '',
                    responseDes: '',
                    subEchoToken: ''
                    }
        */
