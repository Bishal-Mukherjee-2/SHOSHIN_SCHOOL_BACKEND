import { expect, assert } from "chai";

describe("Index Tests", function () {
	it("Test case 1 => Should pass", function () {
		assert(true === true, "Assertion failed!");
	});

	it("Test case 2 => Should fail", function (done) {
		try {
			expect(true).to.be.false;
			done(new Error("Assertion should have failed!"));
		} catch (err) {
			done();
		}
	})
});
