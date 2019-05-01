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
    if (args.length != 1) {
      throw new Error('파라미터의 개수가 맞지 않습니다. \nqueryBook 메소드는 1개의 파라미터를 사용합니다.\n');
    }
    let bookNumber = args[0];

    let bookAsBytes = await stub.getState(bookNumber); //네트워크로부터 정보를 받아옴
    if (!bookAsBytes || bookAsBytes.toString().length <= 0) {
      throw new Error(bookNumber + '라는 책이 존재하지 않습니다.\n');
    }
    console.log(bookAsBytes.toString());
    return bookAsBytes;
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

    //=====================================
    // BOOK_B 를 추가함
    //=====================================
    books.push({
      Name      : 'BOOK_B',
      Publisher : 'COM_B',
      place     : 'ROOM_1',
      owner     : 'None',
      overDue   : 'N'
    });

    //=====================================
    // BOOK_C 를 추가함
    //=====================================
    books.push({
      Name      : 'BOOK_C',
      Publisher : 'COM_C',
      place     : 'ROOM_1',
      owner     : 'PERSON_A',
      overDue   : 'N'
    });

    //=====================================
    // BOOK_D 를 추가함
    //=====================================
    books.push({
      Name      : 'BOOK_D',
      Publisher : 'COM_D',
      place     : 'ROOM_2',
      owner     : 'PERSON_A',
      overDue   : 'Y'
    });

    //=====================================
    // BOOK_E 를 추가함
    //=====================================
    books.push({
      Name      : 'BOOK_E',
      Publisher : 'COM_D',
      place     : 'ROOM_2',
      owner     : 'PERSON_B',
      overDue   : 'N'
    });

    //=====================================
    // BOOK_F 를 추가함
    //=====================================
    books.push({
      Name      : 'BOOK_F',
      Publisher : 'COM_A',
      place     : 'ROOM_2',
      owner     : 'PERSON_C',
      overDue   : 'Y'
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
    console.info('============= 시작 : 새로운 책 추가하기 ===========\n');

    // 파라미터의 개수가 맞지 않으면 에러 발생
    if (args.length != 6) {
      throw new Error('파라미터의 개수가 맞지 않습니다. 5개의 파라미터를 입력하세요.\n');
    }

    var book = {
      docType: 'book',
      Name: args[1],
      Publisher: args[2],
      place: args[3],
      owner: args[4],
      overDue : args[5]
    };

    await stub.putState(args[0], Buffer.from(JSON.stringify(book)));
    console.info('============= 종료 : 새로운 책의 추가를 마쳤습니다 ===========');
  }

  //===============================================================================================
  //  모든 책의 정보를 가져오는 메소드
  //===============================================================================================
  async queryAllBooks(stub, args) {

    let startKey = 'BOOK0';
    let endKey = 'BOOK999';

    // 시작 키 값과 끝 키 값을 통해 범위를 가져옴
    let iterator = await stub.getStateByRange(startKey, endKey);

    let allResults = [];
    while (true) {
      let res = await iterator.next();

      // BOOK의 배열에 원소가 존재하고, 그 원소에 값이 저장되어 있을 때
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};

	// JSON 값 출력
        console.log(res.value.value.toString('utf8'));
	console.log(' test_1\n');

        jsonRes.Key = res.value.key;
        try {
          jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
	  console.log(' test_2\n');
        } catch (err) {
          console.log(err);
          console.log('help2\n');
          jsonRes.Record = res.value.value.toString('utf8');
        }
        allResults.push(jsonRes);
	//allResults.push('\n');
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
	console.log(' test_3 :\n');
        console.info(allResults);
        return Buffer.from(JSON.stringify(allResults));
      }
    }
  }

  async loanBook(stub, args) {
    console.info('============= START : changeCarOwner ===========');
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting 2');
    }

    let bookAsBytes = await stub.getState(args[0]);
    let book = JSON.parse(bookAsBytes);
    book.owner = args[1];

    await stub.putState(args[0], Buffer.from(JSON.stringify(book)));
    console.info('============= END : changeCarOwner ===========');
  }
};

shim.start(new Chaincode());
