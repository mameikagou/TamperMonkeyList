function bilibiliHelper() {
//   this.isRun = function () {
//     return window.location.host.indexOf("bilibili.com") != -1;
//   };
  this.baseFunction = function () {
    /**
     * b站基本功能，一件三连、视频解析、视频下载
     */
    function baseFunctionObject() {
      this.elementId = Math.ceil(Math.random() * 100000000) + "mmx";
      this.downloadSettingKey = "download_setting_key";
      this.downloadResutError = function (btnElement) {
        btnElement.text("下载视频/封面（最高清）");
        btnElement.removeAttr("disabled");
      };
      this.downloadResutSuccess = function (btnElement) {
        btnElement.text("下载视频/封面（最高清）");
        btnElement.removeAttr("disabled");
      };
      this.getDownloadPages = function () {
        return new Promise(function (resolve, reject) {
          var pathname = window.location.pathname,
            bv = null;
          if (pathname.indexOf("/medialist/play/watchlater/") != -1) {
            // 在下载视频的时候针对稍后再看页面的链接找BV号
            bv = pathname
              .replace("/medialist/play/watchlater/", "")
              .replace("/", "");
          } else {
            bv = pathname.replace("/video/", "").replace("/", "");
          }
          if (!bv) {
            resolve({ status: "bv_null" });
            return;
          }
          //bv转av
          commonFunctionObject
            .request(
              "get",
              "https://api.bilibili.com/x/web-interface/view?bvid=" + bv,
              null
            )
            .then((resultData) => {
              let dataJson = JSON.parse(resultData.data);
              if (!dataJson || dataJson.code !== 0 || !dataJson.data) {
                resolve({ status: "request_error" });
                return;
              }

              let data = dataJson.data;
              if (!data) {
                resolve({ status: "aid_null" });
                return;
              }

              let aid = data.aid;
              let pic = data.pic;
              let title = data.title;
              if (!aid) {
                resolve({ status: "aid_null" });
                return;
              }

              //获取cid
              commonFunctionObject
                .request(
                  "get",
                  "https://api.bilibili.com/x/web-interface/view?aid=" + aid,
                  null
                )
                .then((resultData2) => {
                  let dataJson2 = JSON.parse(resultData2.data);
                  if (!dataJson2 || dataJson2.code !== 0 || !dataJson2.data) {
                    resolve({ status: "request_error" });
                    return;
                  }
                  const downloadData = dataJson2.data;
                  const aid = downloadData.aid,
                    bvid = downloadData.bvid;
                  const pages = new Array();
                  for (var i = 0; i < downloadData.pages.length; i++) {
                    let pageData = downloadData.pages[i];
                    pages.push({
                      cover: pageData.first_frame,
                      page: pageData.page,
                      part: pageData.part,
                      cid: pageData.cid,
                    });
                  }
                  resolve({
                    status: "success",
                    downloadData: {
                      aid: aid,
                      bvid: bvid,
                      pages: pages,
                      pic: pic,
                      title: title,
                    },
                  });
                })
                .catch((errorData) => {
                  resolve({ status: "request_error" });
                });
            })
            .catch((errorData) => {
              resolve({ status: "request_error" });
            });
        });
      };
      this.startDownloadFile = function (options) {
        let aid = options.aid,
          cid = options.cid,
          fileName = options.fileName,
          savePath = options.savePath,
          RPCURL = options.RPCURL,
          RPCToken = options.RPCToken;
        let isByPRC = options.isByPRC;

        commonFunctionObject
          .request(
            "get",
            "https://api.bilibili.com/x/player/playurl?avid=" +
              aid +
              "&cid=" +
              cid +
              "&qn=112",
            null
          )
          .then((resultData3) => {
            if (!fileName) {
              fileName = new Date().getTime() + "";
            }
            fileName = fileName.replace(
              /[\ |\~|\`|\=|\||\\|\;|\:|\"|\'|\,|\.|\>|\/]/g,
              ""
            );
            fileName = fileName.substring(0, 50); //可能有异常，标题最多50字符
            fileName = fileName + ".mp4";

            let dataJson3 = JSON.parse(resultData3.data);
            if (!!dataJson3 && dataJson3.code === 0 && !!dataJson3.data) {
              let downloadUrl = dataJson3.data.durl[0].url;
              if (isByPRC) {
                commonFunctionObject
                  .RPCDownloadFile(fileName, downloadUrl, savePath, RPCURL)
                  .then((data) => {
                    commonFunctionObject.webToast({
                      message: data,
                      time: 3000,
                    });
                  })
                  .catch((data) => {
                    commonFunctionObject.webToast({
                      message: data,
                      time: 3000,
                    });
                  });
              } else {
                window.open(downloadUrl);
              }
            } else {
              commonFunctionObject.webToast({
                message: "获取下载链接失败",
                background: "#FF4D40",
              });
            }
          })
          .catch((errorData) => {
            commonFunctionObject.webToast({
              message: "获取下载链接失败",
              background: "#FF4D40",
            });
          });
      };
      this.createModals = function () {
        var css =
          `
                    .modal-mask-` +
          this.elementId +
          `{
                        position:fixed;
                        top:0;
                        left:0;
                        z-index:999;
                        width:100%;
                        height:100%;
                        display:none;
                        background-color:#000;
                        opacity:0.3;
                        overflow:hidden;
                    }
                    .modal-body-` +
          this.elementId +
          `{
                        position:fixed;
                        border-radius:5px;
                        background-color: #FFFFFF;
                        top:10%;
                        width:600px;
                        max-width:90%;
                        max-height:80%;
                        z-index:1000;
                        left: 50%;
                        transform: translateX(-50%);
                        display:none;
                        padding: 10px;
                        overflow-y: auto;
                    }
                    .modal-body-` +
          this.elementId +
          ` >.page-header{
                        height:30px;
                        line-height:30px;
                        position:relative;
                    }
                    .modal-body-` +
          this.elementId +
          ` >.page-header >span{
                        display:inline-block;
                    }
                    .modal-body-` +
          this.elementId +
          ` >.page-header >span:nth-child(1) {
                        font-size:18px;
                        font-weight:bold;
                        position:absolute;
                        left:10px;
                    }
                    .modal-body-` +
          this.elementId +
          ` >.page-header >span:nth-child(2) {
                        font-size:28px;
                        font-weight:bold;
                        position:absolute;
                        right:10px;
                        cursor:pointer;
                    }
                    .modal-body-` +
          this.elementId +
          ` >.page-container{
                        max-height: 500px;
                        overflow-y: auto;
                    }
                    .modal-body-` +
          this.elementId +
          ` .page-wrap{
                        display: flex;
                        flex-wrap: wrap;
                        margin-top:5px;
                    }
                    .modal-body-` +
          this.elementId +
          ` .page-wrap >.board-item{
                        display: block;
                        width: calc(50% - 10px);
                        background-color: #6A5F60;
                        margin: 5px;
                        background-color:#FB7299;
                        color:#FFFFFF;
                        cursor: pointer;
                        overflow:hidden;
                        white-space:nowrap;
                        text-overflow:ellipsis;
                    }
                    .modal-body-` +
          this.elementId +
          ` .page-wrap >.board-item >input{
                        width: 14px;
                        height: 14px;
                        vertical-align: middle;
                        margin-right:5px;
                    }
                    .modal-body-` +
          this.elementId +
          ` .page-wrap >.board-item >span{
                        vertical-align: middle;
                    }
                    .modal-body-` +
          this.elementId +
          ` .modal-btn-wrap{
                        text-align: center;
                        margin-top: 10px;
                        cursor: pointer;
                    }
                    .modal-body-` +
          this.elementId +
          ` .aria2-setting{
                        border:1px dashed #F1F1F1;
                        border-radius:4px;
                        margin-top:10px;
                    }
                    .modal-body-` +
          this.elementId +
          ` .aria2-setting >.setting-item{
                        text-align: center;
                        font-size:14px;
                        margin:10px 0px;
                    }
                    .modal-body-` +
          this.elementId +
          ` .aria2-setting >.setting-item .topic-name{
                        display:inline-block;
                        width:80px;
                        text-align:left;
                    }
                    .modal-body-` +
          this.elementId +
          ` .aria2-setting >.setting-item> input{
                        width:300px;
                        padding-left:10px;
                        border:1px solid #888;
                        outline:none;
                        border-radius:3px;
                    }
                    .modal-body-` +
          this.elementId +
          ` .modal-btn-wrap >span{
                        border:1px solid #ccc;
                        display:inline-block;
                        padding:3px 5px;
                        margin:0px 5px;
                        border-radius:3px;
                    }
                    .modal-body-` +
          this.elementId +
          ` .tip-wrap{
                        margin-top: 10px;
                        font-size:12px;
                    }
                    .modal-body-` +
          this.elementId +
          ` .tip-wrap >.title{
                        font-size:16px;
                        font-weight:bold;
                    }
                    .modal-body-` +
          this.elementId +
          ` .tip-wrap >.content >ul >li{
                        margin-top:5px;
                    }
                `;

        var html =
          `
                    <div class='modal-mask-` +
          this.elementId +
          `'></div>
                    <div class='modal-body-` +
          this.elementId +
          `'>
                        <div class="page-header">
                            <span>视频下载(可批量)</span>
                            <span class="close">×</span>
                        </div>
                        <div class="page-container">
                            <div class="page-wrap"></div>
                            <div class="aria2-setting">
                                <div class="setting-item">
                                    <span><input type="radio" name="downloadWay" value="Motrix">Motrix下载</span>&nbsp;&nbsp;&nbsp;
                                    <span><input type="radio" name="downloadWay" value="AriaNgGUI">AriaNgGUI下载</span>
                                </div>
                                <div class="setting-item">
                                    <label class="topic-name">配置RPC:</label><input type="text" name="RPCURL" value="" placeholder="请准确输入RPC对应软件的地址，默认：Motrix">
                                </div>
                                <div class="setting-item">
                                    <label class="topic-name">配置Token:</label><input type="text" name="RPCToken" value="" placeholder="默认无需填写">
                                </div>
                                <div class="setting-item">
                                    <label class="topic-name">保存路径:</label><input type="text" name="savePath" value="" placeholder="请准确输入文件保存路径">
                                    <div style="font-size:12px;color:#888;">最好自定义下载地址，默认地址可能不满足需要</div>
                                </div>
                            </div>
                            <div class="modal-btn-wrap">
                                <span name="selectall">全选</span>
                                <span name="removeSelect">取消选择</span>
                                <span name="downloadAll">批量下载</span>
                            </div>
                            <div class="tip-wrap">
                                <div class="title">关于单P下载：</div>
                                <div class="content"><span>点击弹框单个选集，即可下载单集视频！PS:单P下载，推荐大家使用BBDown下载，此工具功能很强大，具体查看：<a target="_blank" href="https://github.com/nilaoda/BBDown">https://github.com/nilaoda/BBDown</a></span></div>
                            </div>
                            <div class="tip-wrap">
                                <div class="title">关于批量下载：</div>
                                <div class="content">
                                    <ul>
                                        <li>
                                            <b>1、批量下载需要第三方软件的支持，脚本推荐使用：Motrix</b>
                                            <ul>
                                                <li>Motrix下载地址：<a href="https://motrix.app/zh-CN/" target="_blank">https://motrix.app/zh-CN/</a></li>
                                                <li>AriaNgGUI下载地址：<a href="https://github.com/Xmader/aria-ng-gui" target="_blank">https://github.com/Xmader/aria-ng-gui</a></li>
                                            </ul>
                                        </li>
                                        <li>
                                            <b>2、在批量下载前需要提前打开软件，本教程以Motrix为准</b>
                                            <ul>
                                                <li>(1)、如果全部按照默认配置，只需要打开软件即可</li>
                                                <li>(2)、如果想自定义RPC地址和文件保存路径，可更改上面输入框的内容（此数据非常重要，请准确填写）</li>
                                                <li>
                                                (3)、Motrix运行图片
                                                <img src="https://pic.rmb.bdstatic.com/bjh/8912582c0416119405ec37ea27d12376.jpeg" width="100%" />
                                                </li>
                                            </ui>
                                        </li>
                                        <li>
                                            <b>3、默认RPC默认地址</b>
                                            <ul>
                                                <li>(1)、Motrix RPC默认地址：ws://localhost:16800/jsonrpc</li>
                                                <li>(2)、Aria2 RPC默认地址：ws://localhost:6800/jsonrpc</li>
                                                <li>(3)点击“批量下载会自动保存当前下载设置”</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <b>4、如使用AriaNgGUI，使用方式类似，大家可以自行研究</b>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="tip-wrap">
                                <div class="title">必要说明：</div>
                                <div class="content">
                                    申明：本功能仅能作为学习交流使用，且不可用于其它用途，否则后果自负。请大家重视版权，尊重创作者，切勿搬运抄袭。请大家多用[一键三连]为创作者投币~，小破站牛掰！
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        commonFunctionObject.GMaddStyle(css);
        $("body").append(html);
      };
      this.hideModals = function () {
        $(".modal-body-" + this.elementId + "").css("display", "none");
        $(".modal-mask-" + this.elementId + "").css("display", "none");
      };
      this.showModals = function (pageHtml) {
        const self = this;
        const downloadSettingKey = self.downloadSettingKey;
        $(".modal-body-" + self.elementId + "").css("display", "block");
        $(".modal-mask-" + self.elementId + "").css("display", "block");
        $(".modal-body-" + self.elementId + " .page-wrap").html(pageHtml);

        //初始化设置的数据
        var savePath = "D:/";
        if ("macOS" === commonFunctionObject.getSystemOS()) {
          savePath = "";
        }
        const downloadSetting = commonFunctionObject.GMgetValue(
          this.downloadSettingKey,
          {
            RPCURL: "ws://localhost:16800/jsonrpc",
            savePath: savePath,
            RPCToken: "",
            downloadWay: "Motrix",
          }
        );
        const isMotrix = downloadSetting.downloadWay == "Motrix";
        $(".modal-body-" + self.elementId + " input[name='RPCURL']").val(
          downloadSetting.RPCURL
        );
        $(".modal-body-" + self.elementId + " input[name='savePath']").val(
          downloadSetting.savePath
        );
        $(".modal-body-" + self.elementId + " input[name='RPCToken']").val(
          downloadSetting.RPCToken
        );
        $(
          ".modal-body-" + self.elementId + " input[name='downloadWay']"
        ).removeAttr("checked");
        if (isMotrix) {
          $(
            ".modal-body-" + self.elementId + " input:radio[value='Motrix']"
          ).attr("checked", "true");
        } else {
          $(
            ".modal-body-" + self.elementId + " input:radio[value='AriaNgGUI']"
          ).attr("checked", "true");
        }

        $(".modal-body-" + self.elementId + " .page-wrap >.board-item >span")
          .off("click")
          .on("click", function () {
            $(this).css("background-color", "#ccc");
            let downloadOptions = {
              aid: $(this).data("aid"),
              cid: $(this).data("cid"),
              isByPRC: false,
            };
            self.startDownloadFile(downloadOptions);
          });
        $(".modal-body-" + self.elementId + " .page-header >span.close")
          .off("click")
          .on("click", function () {
            self.hideModals();
          });
        $(
          ".modal-body-" +
            self.elementId +
            " .modal-btn-wrap >span[name='selectall']"
        )
          .off("click")
          .on("click", function () {
            $(".modal-body-" + self.elementId + " .page-wrap")
              .find("input[type='checkbox']")
              .each(function () {
                $(this).prop("checked", true);
              });
          });
        $(".modal-body-" + self.elementId + " input[name='downloadWay']")
          .off("change")
          .on("change", function () {
            if ($(this).val() == "Motrix") {
              $(".modal-body-" + self.elementId + " input[name='RPCURL']").val(
                "ws://localhost:16800/jsonrpc"
              );
            } else {
              $(".modal-body-" + self.elementId + " input[name='RPCURL']").val(
                "ws://localhost:6800/jsonrpc"
              );
            }
          });
        $(
          ".modal-body-" +
            self.elementId +
            " .modal-btn-wrap >span[name='removeSelect']"
        )
          .off("click")
          .on("click", function () {
            $(".modal-body-" + self.elementId + " .page-wrap")
              .find("input[type='checkbox']")
              .each(function () {
                $(this).prop("checked", false);
              });
          });
        $(
          ".modal-body-" +
            self.elementId +
            " .modal-btn-wrap >span[name='downloadAll']"
        )
          .off("click")
          .on("click", function () {
            let RPCURL = $(
              ".modal-body-" + self.elementId + " input[name='RPCURL']"
            ).val();
            let savePath = $(
              ".modal-body-" + self.elementId + " input[name='savePath']"
            ).val();
            let RPCToken = $(
              ".modal-body-" + self.elementId + " input[name='RPCToken']"
            ).val();
            let downloadWay = $(
              ".modal-body-" +
                self.elementId +
                " input[name='downloadWay']:checked"
            ).val();
            commonFunctionObject.GMsetValue(downloadSettingKey, {
              RPCURL: RPCURL,
              savePath: savePath,
              RPCToken: RPCToken,
              downloadWay: downloadWay,
            });

            let inputElements = $(
              ".modal-body-" +
                self.elementId +
                " .page-wrap input[type='checkbox']:checked"
            );
            if (inputElements.length == 0) {
              commonFunctionObject.webToast({
                message: "至少需要选中1P",
                background: "#FF4D40",
              });
              return;
            }

            if (!savePath) {
              commonFunctionObject.webToast({
                message: "保存路径不能为空",
                background: "#FF4D40",
              });
              return;
            }
            if (!RPCURL) {
              commonFunctionObject.webToast({
                message: "PRC地址不能为空",
                background: "#FF4D40",
              });
              return;
            }
            RPCToken = !RPCToken ? "" : RPCToken;
            let downloadOptions = {
              aid: "",
              cid: "",
              isByPRC: true,
              fileName: "",
              savePath: savePath,
              RPCURL: RPCURL,
              RPCToken: RPCToken,
            };
            inputElements.each(function () {
              setTimeout(() => {
                let aid = $(this).data("aid"),
                  cid = $(this).data("cid"),
                  fileName = $(this).attr("title");
                downloadOptions.aid = aid;
                downloadOptions.cid = cid;
                downloadOptions.fileName = fileName;
                self.startDownloadFile(downloadOptions);
              }, 1000);
            });
          });
      };
      this.createElementHtml = async function () {
        //首先判断页面是否加载完全
        let videoContainer = await commonFunctionObject.getElementObject(
          ".total-reply"
        );
        if (!videoContainer) {
          return false;
        }
        $("#bilibili_exti_9787fjfh12j").remove();

        const randomNumber = this.elementId,
          self = this;
        let cssText = `
                    #bilibili_exti_9787fjfh12j{
                        padding:10px;
                    }
                    #bilibili_exti_9787fjfh12j >.self_s_btn{
                        background-color:#FB7299;
                        color:#FFF;
                        font-size:10px;
                        display:inline-block;
                        margin-right:15px;
                        padding:2px 4px;
                        border-radius:3px;
                        cursor:pointer;
                    }
                `;
        let htmlText =
          `
                    <div id="bilibili_exti_9787fjfh12j">
                        <span class="self_s_btn" id="download_s_` +
          randomNumber +
          `">下载视频/封面（最高清）</span>
                        <span class="self_s_btn" id="focus_s_` +
          randomNumber +
          `">一键三连</span>
                    </div>
                `;

        //添加下载等操作按钮
        let $viewboxReport = $("#arc_toolbar_report");
        if (
          $("#focus_s_" + randomNumber).length == 0 &&
          $viewboxReport.length != 0
        ) {
          $("body").prepend("<style>" + cssText + "</style>");
          $viewboxReport.before(htmlText);
        }

        //创建弹框
        this.createModals();

        //下载操作函数
        $("body").on("click", "#download_s_" + randomNumber, function () {
          const btnElement = $(this);
          btnElement.attr("disabled", "disabled");
          btnElement.text("下载视频/封面（准备中）");
          //开始准备下载数据
          self
            .getDownloadPages()
            .then((resule) => {
              if (resule.status === "success") {
                var aid = resule.downloadData.aid,
                  pages = resule.downloadData.pages,
                  itemHtml = "",
                  pic = resule.downloadData.pic;
                var picTitle = resule.downloadData.title;
                itemHtml +=
                  "<div style='width:100%;'><a href='" +
                  pic +
                  "' target='_blank'>标题：" +
                  picTitle +
                  "（点我跳转封面）</a></div>";
                for (var i = 0; i < pages.length; i++) {
                  var title = "【P" + pages[i].page + "】" + pages[i].part + "";
                  itemHtml += "<div class='board-item'>";
                  itemHtml +=
                    "<input data-aid='" +
                    aid +
                    "' data-cid='" +
                    pages[i].cid +
                    "' title='" +
                    title +
                    "' type='checkbox'>";
                  itemHtml +=
                    "<span data-aid='" +
                    aid +
                    "' data-cid='" +
                    pages[i].cid +
                    "' title='" +
                    title +
                    "'>" +
                    title +
                    "</span>";
                  itemHtml += "</div>";
                }
                self.showModals(itemHtml);
                self.downloadResutSuccess(btnElement);
              } else {
                self.downloadResutError(btnElement);
              }
            })
            .catch((error) => {
              self.downloadResutError(btnElement);
            });
        });
        $("body").on("click", "#focus_s_" + randomNumber, function () {
          $("#arc_toolbar_report .video-like").click(); // 点赞
          $("#arc_toolbar_report .video-coin").click(); // 投币
          // $("#arc_toolbar_report .video-fav").click(); // 收藏
        });
      };
      this.start = function () {
        let locationHost = window.location.host,
          locationPathname = window.location.pathname;
        if (
          locationHost === "www.bilibili.com" &&
          (locationPathname.indexOf("/video") != -1 ||
            locationPathname.indexOf("/watchlater") != -1)
        ) {
          this.createElementHtml();
        }
      };
    }
    try {
      new baseFunctionObject().start();
    } catch (e) {
      console.log("baseFunctionObject new error", e);
    }
  };
  /**
   * 浏览历史记录提醒
   */
  this.recordViewFunction = function () {
    function recordViewObject() {
      this.localCacheName = "bilibili_video_record";
      this.recordOneVideo = function () {
        let promise = new Promise((resolve, reject) => {
          let bv = commonFunctionObject.getBilibiliBV();
          let cacheText = commonFunctionObject.GMgetValue(this.localCacheName);
          cacheText = !cacheText ? "" : cacheText;
          let maxLength = 12 * 500;
          let currentLength = cacheText.length;
          if (currentLength > maxLength) {
            cacheText = cacheText.substring(12 * 100, currentLength);
          }

          if (cacheText.indexOf(bv) == -1) {
            cacheText += bv;
            commonFunctionObject.GMsetValue(this.localCacheName, cacheText);
          }
          resolve({ result: "success" });
        });
      };
      this.searchPageRemindHtml = function ($ele, top = 8, right = 8) {
        if ($ele.find("div[name='marklooked']").length == 0) {
          $ele.css("position", "relative");
          $ele.append(
            "<div name='marklooked' style='z-index: 100;position:absolute; top:" +
              top +
              "px; right:" +
              right +
              "px; background-color: rgba(251,123,159,1); border-radius:3px; font-size:10px; color:#FFF;padding:0px 2px;'>已看</div>"
          );
        }
      };
      this.searchPageRemind = function () {
        let $that = this;
        var elementArray = [
          { node: ".bili-video-card", top: 8, right: 12 }, //兼容 MAC M1搜索结果
          { node: "#page-index .small-item", top: 12, right: 12 }, //用户投稿
          { node: "#submit-video-list .small-item", top: 12, right: 12 }, //用户主页
          {
            node: "#page-series-detail .small-item.fakeDanmu-item",
            top: 12,
            right: 12,
          }, //用户主页投稿
        ];
        setInterval(function () {
          let cacheText = commonFunctionObject.GMgetValue($that.localCacheName);
          cacheText = !cacheText ? "" : cacheText;
          for (var i = 0; i < elementArray.length; i++) {
            var elementobj = elementArray[i];
            $(elementobj.node).each(function () {
              if ($(this).attr("dealxll") !== "true") {
                var videourl = $(this)
                  .find("a[href^='//www.bilibili.com/video']")
                  .attr("href");
                if (!!videourl) {
                  var bvs = videourl.match(/(\/BV(.*?)\/)/g);
                  if (bvs.length == 1) {
                    var bv = bvs[0].replace(/\//g, "");
                    if (cacheText.indexOf(bv) != -1) {
                      $that.searchPageRemindHtml(
                        $(this),
                        elementobj.top,
                        elementobj.right
                      );
                    }
                    $(this)
                      .unbind("click")
                      .bind("click", () => {
                        //循环操作，单独绑定
                        $that.searchPageRemindHtml(
                          $(this),
                          elementobj.top,
                          elementobj.right
                        );
                      });
                  }
                  $(this).attr("dealxll", "true");
                }
              }
            });
          }
        }, 500);
      };
      this.start = function () {
        let $that = this;
        if (
          window.location.pathname.indexOf("/video") != -1 &&
          window.location.host === "www.bilibili.com"
        ) {
          let currentHref = "";
          setInterval(() => {
            //需要循环存储
            if (window.location.href !== currentHref) {
              this.recordOneVideo();
              currentHref = window.location.href;
            }
          }, 500);
        }
        //搜索结果和用户主页已经看过的视频提醒
        if (window.location.host.indexOf("bilibili.com") != -1) {
          this.searchPageRemind();
          GM_registerMenuCommand("清空B站浏览记录", function () {
            if (confirm("是否要清空B站浏览记录？清空后将不可恢复...")) {
              commonFunctionObject.GMsetValue($that.localCacheName, "");
            }
          });
        }
      };
    }
    try {
      new recordViewObject().start();
    } catch (e) {
      console.log("recordViewObject new error", e);
    }
  };
  /**
   * 视频描述文本转链接
   */
  this.textToLinkFunction = function () {
    function textToLinkObject() {
      this.link = function () {
        if (
          findAndReplaceDOMText(document.querySelector(".desc-info-text"), {
            find: /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g,
            replace: function (e, t) {
              let text = e.text;
              let element = null;
              if (
                text.indexOf("bilibili.com") == -1 &&
                /^(http|ftp|https)/i.test(text)
              ) {
                element = document.createElement("a");
                element.setAttribute("href", text);
                element.setAttribute("target", "_blank");
              } else {
                element = document.createElement("span");
              }
              element.innerText = text;
              return element;
            },
            preset: "prose",
          })
        );
      };
      this.start = function () {
        let MutationObserver =
          window.MutationObserver ||
          window.WebKitMutationObserver ||
          window.MozMutationObserver;
        let bodyMutationObserver = new MutationObserver(() => {
          this.link();
        });
        let titleElement = document.querySelector("title");
        if (titleElement) {
          bodyMutationObserver.observe(titleElement, {
            characterData: true,
            attributes: true,
            childList: true,
          });
        }
      };
    }
    try {
      new textToLinkObject().start();
    } catch (e) {
      console.log("textToLinkObject new error", e);
    }
  };
  this.signIn = async function () {
    //Blibili 自动签到
    const myDate = new Date();
    var currentDate =
      myDate.getFullYear() +
      "-" +
      (myDate.getMonth() + 1) +
      "-" +
      myDate.getDate();
    var text = "今日已签";
    if (
      commonFunctionObject.GMgetValue("bilibili_signIn", null) === currentDate
    ) {
      //已经签到
      text = "今日已签";
    } else {
      try {
        const result = await commonFunctionObject.request(
          "GET",
          "https://api.live.bilibili.com/sign/doSign",
          null
        );
        if (result && result.result == "success") {
          const json = JSON.parse(result.data);
          if (json.hasOwnProperty("code")) {
            const code = json.code;
            if (code == -101) {
              //未登录
              text = "未登录";
            } else if (code == 1011040) {
              //已经签到了
              text = "今日已签";
              commonFunctionObject.GMsetValue("bilibili_signIn", currentDate);
            } else if (code == 0) {
              //签到成功
              text = "今日已签";
              commonFunctionObject.GMsetValue("bilibili_signIn", currentDate);
            } else {
              text = "签到异常";
            }
          } else {
            text = "签到异常";
          }
        }
      } catch (e) {
        text = "签到出错";
      }
    }
    var html =
      `
				<div id="bilibili_signIn" style="width:12px;font-size:12px;position:fixed;top:200px;left:0px;background-color:#FC8BAB;color:#FFF;">` +
      text +
      `</div>
			`;
    $("body").append(html);
  };
  this.start = function () {
    if (this.isRun()) {
      this.baseFunction();
      this.recordViewFunction();
      this.textToLinkFunction();
      this.signIn();
    }
  };
}
