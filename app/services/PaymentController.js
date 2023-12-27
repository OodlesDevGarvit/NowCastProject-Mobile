// export const MakePayment = () => {

// }

// const getSecreKey = () => {
//     let axiosConfig = {
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//         Authorization: 'Bearer ' + `${token}`,
//         'Access-Control-Allow-Origin': '*',
//       },
//     };
//     axiosInstance1
//       .get(`${API.SecretKeyGiving}`, axiosConfig)
//       .then((res) => {
//         console.log("api key", res);
//         setPublishableKey(res.data.data.stripeApiKey);
//         stripe.setOptions({
//           publishableKey: `${res.data.data.stripeApiKey}`,
//         });
//       })
//       .catch((err) => {
//         // console.log("error:", err)
//       });

//   };