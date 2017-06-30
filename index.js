const config = {
    "v2": {
        fe: {
            id: 171,
            branch: "master-test"
        },
        backEnd: {
            id: 174,
            branch: "dev"
        }
    },
    "v3": {
        fe: {
            id: 220,
            branch: "v3.1"
        },
        backEnd: {
            id: 222,
            branch: "test"
        }
    }
}
class Events {
    constructor() {
        this.eventquene = [];
    }
    on(type, callback) {

        this.eventquene[type] || (this.eventquene[type] = []);
        this.eventquene[type].push(callback);
    }
    trigger(type) {

        if (this.eventquene[type] && this.eventquene[type].length > 0) {
            this.eventquene[type].forEach(o => {
                if (typeof o == "function") {

                    o();
                }
            })
        }
    }
}
class Build extends Events {
    /**
     * Creates an instance of Build.
     * @param {any} options
     * 需传入name，类型，分支名 projectID 
     * @memberof Build
     */
    constructor(options) {
        super();
        this.options = options;
        this.urls = {
            start: `https://domeos.sohucs.com/api/ci/build/start`,
            getState: `https://domeos.sohucs.com/api/ci/buildInfo/${this.options.projectId}/page?page=1&count=10`
        }
        this.payLoad = {
            projectId: this.options.projectId,
            codeInfo: {
                codeBranch: this.options.branch
            },
            imageInfo: {}
        };
        this.done = false;
        // this.eventquene = [];
        this.start();
    }

    start() {
        $.ajax({
            type: "post",
            url: this.urls.start,
            data: JSON.stringify(this.payLoad),
            // dataType:"json",
            contentType: "application/json;charset=utf8",
        }).done(() => {
            console.log("biu.....")
            this.polling();
        })
    }
    polling() {
        setTimeout(() => {
            console.log(this.options.name + "  编译中...")
            $.ajax({
                type: "get",
                url: this.urls.getState,
            }).done((res) => {

                if (res.resultCode == 200) {
                    if (res.result.buildHistories[0].state == "Success") {
                        this.done = true;
                        this.trigger("done");
                    } else {

                        this.polling();
                    }

                }
                else {
                    throw new Error(res.resultMsg);
                }
            })
        }, 2000)
    }
}
class Deploy extends Events {
    constructor(id) {
        super();
    }
    getVersion() {

    }
}

function Startdeploy(type) {
    let f = new Build({
        projectId: config[type]["fe"]["id"],
        name: type + "前端",
        branch: config[type]["fe"]["branch"],
    });

    let later = function (instatnce) {
        return new Promise((resolve, reject) => {
            instatnce.on("done", () => resolve())
        })
    }
    later(f).then(() => {
        console.log("前端编译成功，开始编译后端。。。")
        let b = new Build({
            projectId: config[type]["backEnd"]["id"],
            name: type + "后端",
            branch: config[type]["backEnd"]["branch"],
        });
        return later(b)
    })
        .then(() => {
            console.log("后端编译成功，去部署吧。。。")
            alert("后端编译成功，可以部署了")
            // new Deploy();
        })


}
Startdeploy("v2")