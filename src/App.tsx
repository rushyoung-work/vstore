import React, { useState } from 'react';
import axios from "axios";

function App() {
  let offers: any = {};
  const [loginCheck, setLoginCheck] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("kr");

  const [shopList, setShopList] = useState([])
  const [shopBonusList, setShopBonusList] = useState([])
  const [loding, setLoding] = useState(false);
  const [reLoad, setRreload] = useState(false);
  
  const login = async () => {

    setShopList([])
    setLoding(true);

    try {
     
      try {
        try {
          const a = await axios({ 
            url: "http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://auth.riotgames.com/logout?",
            method: "GET",
            withCredentials: false,
            headers :{
              'X-Requested-With' : 'XMLHttpRequest'
            }
          });
          

        } catch(e) {
          const a = await axios({ 
            url: "http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://auth.riotgames.com/logout?",
            method: "GET",
            withCredentials: false,
            headers :{
              'X-Requested-With' : 'XMLHttpRequest'
            }
          });
          
        }
      } catch(e) {
        
      }
    
    let auth: any = await axios({ 
      url: "http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://auth.riotgames.com/api/v1/authorization",
      method: "POST",
      data: {
        client_id: "play-valorant-web-prod",
        nonce: "1",
        redirect_uri: "https://playvalorant.com/opt_in",
        response_type: "token id_token",
      },
      headers: {
        "Content-Type": "application/json",
        'X-Requested-With' : 'XMLHttpRequest'
      },
      withCredentials: false,
    });



    let response: any = (
      await axios({
        url: "http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://auth.riotgames.com/api/v1/authorization",
        method: "PUT",
        data: {
          type: "auth",
          username : userId,
          password,
        },
        headers: {
          "Content-Type": "application/json",
          'X-Requested-With' : 'XMLHttpRequest'
        },
        withCredentials: false,
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
          url: "http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://entitlements.auth.riotgames.com/api/token/v1",
          method: "POST",
          data: {},
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            'X-Requested-With' : 'XMLHttpRequest'
          },
          withCredentials: false,
        }) 
      ).data as any
    ).entitlements_token;

    

    const userIds = (
      (
        await axios({
          url: "http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://auth.riotgames.com/userinfo",
          method: "POST",
          data: {},
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            'X-Requested-With' : 'XMLHttpRequest'
          },
          withCredentials: false,
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
    
    await getShop(user)
  
    return user;

    } catch(e) {
      
    }
    

    
  }

  const getShop = async (user : any) => {
    const shop: any = (
      await axios({
        url: `http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://pd.kr.a.pvp.net/store/v2/storefront/${user.id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Riot-Entitlements-JWT": user.entitlementsToken,
          Authorization: `Bearer ${user.accessToken}`,
          'X-Requested-With' : 'XMLHttpRequest'
        },
        withCredentials: false,
      })
    ).data;

  
    var singleItems = shop.SkinsPanelLayout.SingleItemOffers;
    var BonusItems = shop.BonusStore.BonusStoreOffers;
  
    for (var i = 0; i < singleItems.length; i++) {
      singleItems[i] = (
        (
          await axios({
            url: `http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://valorant-api.com/v1/weapons/skinlevels/${singleItems[i]}`,
            method: "GET",
            headers : {
              'X-Requested-With' : 'XMLHttpRequest'
            }
          })
        ).data as any
      ).data;
      singleItems[i].price = offers[singleItems[i].uuid];
    }

    for (var i = 0; i < BonusItems.length; i++) {
      let price = BonusItems[i].Offer.Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"];
      let DiscountPercent = BonusItems[i].DiscountPercent;
      let DiscountPrice = BonusItems[i].DiscountCosts["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"];

      BonusItems[i] = (
        (
          await axios({
            url: `http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://valorant-api.com/v1/weapons/skinlevels/${BonusItems[i].Offer.OfferID}`,
            method: "GET",
            headers : {
              'X-Requested-With' : 'XMLHttpRequest'
            }
          })
        ).data as any
      ).data;
      BonusItems[i].price = price
      BonusItems[i].DiscountPercent = DiscountPercent
      BonusItems[i].DiscountPrice = DiscountPrice
    }
    setShopList(singleItems);
    setShopBonusList(BonusItems);
    setRreload(!reLoad)
    setLoding(false);
    return { singleItems } as any;
  }

  const loadOffers =  async (user : any) => {
    let response: any = (
      await axios({
        url: `http://ec2-13-209-7-177.ap-northeast-2.compute.amazonaws.com:8080/https://pd.kr.a.pvp.net/store/v1/offers`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Riot-Entitlements-JWT": user.entitlementsToken,
          Authorization: `Bearer ${user.accessToken}`,
          'X-Requested-With' : 'XMLHttpRequest'
        },
        withCredentials: false,
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
      

      <div style={{ width : '100%', marginTop : 100}}>
        <div>
          <span style={{display : 'block', fontWeight : 'bold', fontSize : 18}}>
            아이디
          </span>
          <input
            value={userId}
            onChange={(e : any)=> {
              setUserId(e.target.value);
            }}
            style={{width :  500, height : 50, borderRadius : 5, border : '1px solid #ededed', fontSize : 18}}
          />
        </div>

        <div style={{marginTop : 30}}>
          <span style={{display : 'block', fontWeight : 'bold', fontSize : 18}}>
            비밀번호
          </span>
          <input
            type={'password'}
            value={password}
            onChange={(e : any)=> {
              setPassword(e.target.value);
            }}
            style={{width  :  500, height : 50, borderRadius : 5, border : '1px solid #ededed', fontSize : 18}}
          />
        </div>

        <div onClick={()=>{login()}} style={{width  :  500, marginTop : 50, borderRadius : 5, height : 55, backgroundColor : '#2e343b', textAlign : 'center', lineHeight : '55px', cursor : 'pointer'}}>
          <span style={{color : '#fff', fontSize : 18}}>
            접속하기
          </span>
        </div>
      </div>

      {loding && shopList.length === 0 && (
        <span>
          접속중.. 이 메세지가 10초안에 안없어지면 계정이 잘못된거라 다시 확인해보세요.
        </span>
      )}

      {shopList.length !== 0 && (
        <div style={{width : '100%', marginTop : 50, height : 620, flexDirection : 'row', display : 'flex', flexWrap : 'wrap'}}>
          <span style={{fontSize : 22, fontWeight : 'bold', width : '100%', marginTop : 10, marginBottom : 10, display : 'block'}}>
            오늘의 상점
          </span>
          {shopList.map((item : any )=> {
            return (
              <div style={{width: '40%', padding : 15, height:  250, marginBottom : 25, marginRight : 20, borderRadius : 30, border : '1px solid #bfbfbf'}}>
                <img src={item.displayIcon} alt="" style={{width : '100%', height : 200, objectFit : 'cover'}}/>

                <span style={{marginTop : 10, display : 'block'}}>
                  이름 : {item.displayName}
                </span>

                <span style={{marginTop : 10}}>
                  가격 : {item.price}vp 
                </span>
              </div>
            )
          })}
        </div>
      )}

      {shopBonusList.length !== 0 && (
        <div style={{width : '100%', marginTop : 50,  flexDirection : 'row', display : 'flex', flexWrap : 'wrap'}}>
          <span style={{fontSize : 22, fontWeight : 'bold', width : '100%', marginTop : 10, marginBottom : 10, display : 'block'}}>
            야시장
          </span>
          {shopBonusList.map((item : any )=> {
            return (
              <div style={{width: '40%', padding : 15, marginBottom : 25, marginRight : 20, borderRadius : 30, border : '1px solid #bfbfbf'}}>
                <img src={item.displayIcon} alt="" style={{width : '100%', height : 200, objectFit : 'cover'}}/>

                <span style={{marginTop : 10, display : 'block'}}>
                  이름 : {item.displayName}
                </span>

                
                <span style={{marginTop : 7, width:  '100%', display : 'block'}}>
                  할인전 가격 : {item.price}vp
                </span>
                <span style={{marginTop : 5, width:  '100%', display : 'block', fontWeight : 'bold', color : 'red'}}>
                  할인후 가격 : {item.DiscountPrice}vp (-{item.DiscountPercent}%)
                </span>
              </div>
            )
          })}
        </div>
      )}

    </div>
  );
}

export default App;
