import { Color, find, instantiate, Node, Sprite, SpriteFrame, tween } from "cc";
import NodeUtils from "./nodeUtils";
import ConsoleUtils from "./consoleUtils";
import EventUtils, { EventKey } from "./eventUtils";

export enum RouterPage {
  HOME = "Page_Home",
  LEVEL = "Page_Level",
  GAME = "Page_Game",
}

interface RouteItem {
  page: RouterPage;
  node: Node;
}

export default class RouterUtils {
  private constructor() {}
  public static Instance: RouterUtils = new RouterUtils();
  public static init() {
    this._routes = new Map();
    this.route_config = new Map();
  }

  private static _lastRouterTime: number;

  public static get canRouter(): boolean {
    const now = Date.now();
    /*     if (!!this._lastRouterTime) {
      const diffSecond = dayjs(now).diff(this._lastRouterTime, "milliseconds");
      if (diffSecond <= 500) {
        ConsoleUtils.log("路由拦截", { diffSecond }, true);
        return false;
      }
    }
    this._lastRouterTime = now; */
    return true;
  }

  private static _routes: Map<number, RouteItem>;

  private static route_config: Map<RouterPage, string>;

  public static get nowRoute(): RouterPage | null {
    return this.last_route?.page ?? null;
  }
  private static get route_length(): number {
    return this._routes.size;
  }

  public static get last_index(): number {
    return this.route_length - 1;
  }

  private static get last_route(): RouteItem | undefined {
    const nowLength = this.route_length;
    if (nowLength <= 0) return undefined;
    const lastIndex = nowLength - 1;
    const lastItem = this._routes.get(lastIndex);
    return lastItem;
  }

  private static pageTween(pageNode: Node, visible: boolean, destroy: boolean) {
    const nodeSprite = pageNode.getComponent(Sprite);
    if (nodeSprite) {
      tween(pageNode.getComponent(Sprite)!)
        .to(
          0.3,
          { color: new Color(255, 255, 255, visible ? 255 : 0) },
          {
            easing: "quadInOut",
            onStart: () => {
              pageNode.active = true;
            },
            onComplete: () => {
              if (!visible && pageNode.name !== RouterPage.HOME && destroy) {
                ConsoleUtils.log(
                  "RouterUtils_已销毁",
                  { nodeName: pageNode.name },
                  true
                );
                pageNode.destorySelf();
              }
            },
          }
        )
        .start();
    } else {
      if (!visible && pageNode.name !== RouterPage.HOME && destroy) {
        pageNode.destorySelf();
        ConsoleUtils.log(
          "RouterUtils_已销毁",
          { nodeName: pageNode.name },
          true
        );
      }
    }
  }

  private static lastPageVisible(visible: boolean, destroy?: boolean) {
    const lastItem = this.last_route;
    if (!lastItem || !lastItem.node) return;
    this.pageTween(lastItem.node, visible, destroy ?? false);
  }

  private static push(page: RouterPage, node: Node) {
    const index = this.route_length;
    this.lastPageVisible(false);
    this._routes.set(index, { page, node });
    this.pageTween(node, true, false);
    ConsoleUtils.log("RouterUtils", { routes: this._routes }, false);
  }

  private static pop(): RouteItem | null {
    ConsoleUtils.log("RouterUtils", { routes: this._routes }, false);
    const lastItem = this.last_route;
    if (!lastItem) return null;
    if (lastItem.page === RouterPage.HOME) {
      ConsoleUtils.warn("RouterUtils", { msg: "无法在首页返回" }, true);
      return null;
    }
    const popItem = lastItem;
    EventUtils.emit(EventKey.ROUTER_BACK, {
      data: popItem.page,
      success: true,
    });
    this.lastPageVisible(false, true);
    this._routes.delete(this.last_index);
    this.lastPageVisible(true);
    EventUtils.emit(EventKey.ROUTER, {
      data: this.last_route.page,
      success: true,
    });
    return popItem;
  }

  public static back() {
    if (!this.canRouter) return;
    this.pop();
  }

  public static clear() {
    if (this._routes) {
      this._routes?.clear();
    }
  }

  public static async go(page: RouterPage, mustGo = false) {
    if (!this.canRouter && !mustGo) return;
    let pageNode = find(`Canvas/${page}`);
    if (!pageNode) {
      const prefab = await NodeUtils.initPrefab(`prefab/page/${page}`);
      if (!prefab) {
        ConsoleUtils.error("RouterUtils_未找到页面Node以及Prefab", { page });
        return;
      }
      pageNode = instantiate(prefab);
    }
    find("Canvas")!.addChild(pageNode);
    EventUtils.emit(EventKey.ROUTER, { data: page, success: true });
    this.push(page, pageNode);
  }
}

// window.router = RouterUtils;
