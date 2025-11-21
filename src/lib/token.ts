export type token = {
  auth_a_token: string,
  cur_date: string,
  deptPathNm: string,
  empName: string,
  exp: number,
  group_seq: string,
  hash_key: string,
  "transaction-id": string,
  ucUserInfo: string,
}

export  function tokenDecode (token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {

      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload) as token;
}