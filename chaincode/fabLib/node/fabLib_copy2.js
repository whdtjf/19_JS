/*
	도서관 대출 시스템
	네트워크 만들기
	2013122041 김영찬
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

  // 스마트 컨트랙트가 도서관 네트워크를 호출할 때 초기화 하는 메소드
  async Init(stub) {
    console.info('=========== 도서관 네트워크 시작 준비중 ===========\n');
    return shim.success();
  }

  // Invoke 메소드는 스마트컨트렉트가 앱을 실행 했을 때의 결과를 출력해주는 메소드이다.
  // stub를 통해 파라미터를 받아 올 수도 있다.
  async Invoke(stub) {
    // stub를 통해 함수와 파라미터를 받아오도록 함.
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    // 사용자가 입력한 메소드가 존재하지 않으면,
    if (!method) {
      // 에러 로그를 출력하고 Error 발생시킴
      console.error(' '+ret.fcn + '라는 메소드는 존재하지 않습니다.\n');
      throw new Error(' '+ret.fcn + '라는 메소드는 존재하지 않습니다.\n');
    }
    try {
      // 입력받은 메소드를 입력 받은 파라미터들로 실행시키고, 그 결과를 출력함
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      // 도중에 에러가 발생 할 경우, 에러 로그 출력
      console.log(err);
      return shim.error(err+'help1');
    }
  }

  //===============================================================================================
  // 책에 대한 정보를 가져오는 쿼리
  //===============================================================================================
  async queryBook(stub, args) {
	console.log('queryBook\n\n');
  }

  //===============================================================================================
  // 네트워크 초기 설정. 책의 상태를 저장함
  //===============================================================================================
  async initLedger(stub, args) {
    console.info('============= 시작 : LEDGER를 초기화 합니다 ===========\n');
    let books = [];

    //=====================================
    // BOOK_A 를 추가함
    //=====================================
    books.push({
      Name      : 'BOOK_A',
      Publisher : 'COM_A',
      place     : 'ROOM_1',
      owner     : 'None',
      overDue   : 'N'
    });

      //=============================================================================================
    //  JSON 형식의 BOOK들을 추가함
    //=============================================================================================
    for (let i = 0; i < books.length; i++) {
      books[i].docType = 'book';
      await stub.putState('BOOK' + i, Buffer.from(JSON.stringify(books[i])));
      console.info('책이 추가되었습니다.\n', books[i]);
    }
    console.info('============= 종료 : LEDGER의 초기화를 마쳤습니다 ===========\n');
  }


  //===============================================================================================
  //  새로운 책을 추가하는 메소드
  //===============================================================================================
  async createBook(stub, args) {
    console.log('createBook\n');
   }

  //===============================================================================================
  //  모든 책의 정보를 가져오는 메소드
  //===============================================================================================
  async queryAllBooks(stub, args) {
    console.log('queryAllBook\n');
  }

  async loanBook(stub,args) {
    console.log('loanBook\n');
  }
};

shim.start(new Chaincode());
