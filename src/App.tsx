import React, { useState } from 'react';
import axios from "axios";

function App() {
  let offers: any = {};
  const [loginCheck, setLoginCheck] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("kr");
  
  const login = async () => {

    
    

    document.cookie = 'clid=; path=/; expires=-1; domain=riotgames.com' 
    document.cookie = 'clid=; path=/; expires=-1; domain=.riotgames.com' 
    document.cookie = 'clid=; path=/; expires=-1; domain=127.0.0.1' 

    await document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    //clearing local storage
    await localStorage.clear();

    
    let auth: any = await axios({ 
      url: "https://auth.riotgames.com/api/v1/authorization",
      method: "POST",
      data: {
        client_id: "play-valorant-web-prod",
        nonce: "1",
        redirect_uri: "https://playvalorant.com/opt_in",
        response_type: "token id_token",
      },
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin" : '*'
      },
      withCredentials: true,
    });

    console.log({auth})


    let response: any = (
      await axios({
        url: "https://auth.riotgames.com/api/v1/authorization",
        method: "PUT",
        data: {
          type: "auth",
          username : userId,
          password,
        },
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin" : '*'
        },
        withCredentials: true,
      })
    ).data;


    if (response.error === "auth_failure")
    return {
      error: "An auth error occurred, are the given credentials valid?",
    };
    else if (response.error === "rate_limited")
      return { error: "You have been rate limited, please try again later." };

    const uri = response["response"]["parameters"]["uri"];

    const regexResult = uri.match(
      /access_token=((?:[a-zA-Z]|\d|\.|-|_)*).*id_token=((?:[a-zA-Z]|\d|\.|-|_)*).*expires_in=(\d*)/
    );
    const accessToken = regexResult[1];
    const idtoken = regexResult[2];
    const expiresIn = regexResult[3];

     /* Entitlements */
    const entitlementsToken = (
      (
        await axios({
          url: "https://entitlements.auth.riotgames.com/api/token/v1",
          method: "POST",
          data: {},
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        })
      ).data as any
    ).entitlements_token;

    const userIds = (
      (
        await axios({
          url: "https://auth.riotgames.com/userinfo",
          method: "POST",
          data: {},
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        })
      ).data as any
    ).sub;
  
    const user: any = {
      name: userId,
      accessToken,
      entitlementsToken,
      idtoken,
      expiresIn,
      region,
      id: userIds,
      loading: false,
    };
    await loadOffers(user);
    console.log(await getShop(user))
  
    return user;
  }

  const getShop = async (user : any) => {
    const shop: any = (
      await axios({
        url: `https://pd.${region}.a.pvp.net/store/v2/storefront/${user.id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Riot-Entitlements-JWT": user.entitlementsToken,
          Authorization: `Bearer ${user.accessToken}`,
        },
        withCredentials: true,
      })
    ).data;
  
    var singleItems = shop.SkinsPanelLayout.SingleItemOffers;
  
    for (var i = 0; i < singleItems.length; i++) {
      singleItems[i] = (
        (
          await axios({
            url: `https://valorant-api.com/v1/weapons/skinlevels/${singleItems[i]}`,
            method: "GET",
          })
        ).data as any
      ).data;
      singleItems[i].price = offers[singleItems[i].uuid];
    }
  
    return { singleItems } as any;
  }

  const loadOffers =  async (user : any) => {
    let response: any = (
      await axios({
        url: `https://pd.${region}.a.pvp.net/store/v1/offers`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Riot-Entitlements-JWT": user.entitlementsToken,
          Authorization: `Bearer ${user.accessToken}`,
        },
        withCredentials: true,
      })
    ).data;
  
    for (var i = 0; i < response.Offers.length; i++) {
      let offer = response.Offers[i];
      offers[offer.OfferID] = offer.Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"];
    }
  }

  return (
    <div style={{width : 640, height : '100vh', position : 'relative'}}>
      
      <div style={{width : '100%', height : 50, backgroundColor : '#ededed', textAlign : 'center', lineHeight : '50px'}}>
      <span style={{fontSize : 18, fontWeight : 'bold'}}>
          오늘의 상점 확인하자~
        </span>
      </div>
      

      <div style={{position : 'absolute', top : '20%', left : 0, width : '100%'}}>
        <div>
          <span style={{display : 'block', fontWeight : 'bold'}}>
            아이디
          </span>
          <input
            value={userId}
            onChange={(e : any)=> {
              setUserId(e.target.value);
            }}
            style={{width :  320, height : 30, borderRadius : 5, border : '1px solid #ededed'}}
          />
        </div>

        <div style={{marginTop : 30}}>
          <span style={{display : 'block', fontWeight : 'bold'}}>
            비밀번호
          </span>
          <input
            type={'password'}
            value={password}
            onChange={(e : any)=> {
              setPassword(e.target.value);
            }}
            style={{width  :  320, height : 30, borderRadius : 5, border : '1px solid #ededed'}}
          />
        </div>

        <div onClick={()=>{login()}} style={{width  :  320, marginTop : 50, borderRadius : 5, height : 50, backgroundColor : '#2e343b', textAlign : 'center', lineHeight : '50px'}}>
          <span style={{color : '#fff'}}>
            접속하기
          </span>
        </div>
      </div>

    </div>
  );
}

export default App;
