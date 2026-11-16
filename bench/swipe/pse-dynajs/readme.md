Analysis scripts intended to be used in combination with infrastructure in [jalangi2-workspace](https://cement.andrew.cmu.edu/sces60107/jalangi2-workspace).

To use this analysis script, you should follow these instructions:

git clone git@cement.andrew.cmu.edu:sces60107/jalangi2-workspace.git
cd jalangi2-workspace
git clone git@cement.andrew.cmu.edu:sces60107/jalangi2-pse.git \
analyses/primitive-symbolic-execution

And make sure to read the Readme in jalangi2-workspace.


## Running tests:

We currently have tests for semantic transparency (property that states that PSE 
should preserve the semantics of the uninstrumented JavaScript program) in
the `tests/semantic_transparency` folder.

### Prerequisites

You will need to have `Node.js` installed and accessible via the command `node`.
The testing code also makes assumptions about the location of `jalangi2`; please
verify they are correct for your setup in the initialization code of the
`TestRunner` class.

### Run all tests
To run all tests, execute `./run_tests.sh`

Example run:
```bash
$ ./run_tests.sh
Building analysis
Modifying this file: ../primitive-symbolic-execution.js
Done modifying file
Done
Running tests
[x] semantic_transparency/conditional/conditional-concrete.js
--------------------------------------------------
[x] semantic_transparency/conditional/conditional-symbolic.js
--------------------------------------------------
[x] semantic_transparency/string-length/string-length-symbolic.js
--------------------------------------------------
[x] semantic_transparency/string-length/string-length-concrete.js
--------------------------------------------------
[x] semantic_transparency/integer-arithmetic/integer-arithmetic-concrete.js
--------------------------------------------------
[x] semantic_transparency/set-field/set-field-symbolic-base.js
--------------------------------------------------
[x] semantic_transparency/set-field/set-field-symbolic-offset.js
--------------------------------------------------
[x] semantic_transparency/set-field/set-field-concrete.js
--------------------------------------------------
[x] semantic_transparency/set-field/set-field-symbolic-value.js
--------------------------------------------------
[x] semantic_transparency/get-field/get-field-symbolic-offset.js
--------------------------------------------------
[x] semantic_transparency/get-field/get-field-concrete.js
--------------------------------------------------
[x] semantic_transparency/get-field/get-field-symbolic-result.js
--------------------------------------------------
[x] semantic_transparency/typeof/typeof-concrete.js
--------------------------------------------------
[x] semantic_transparency/typeof/typeof-symbolic.js
--------------------------------------------------
Passed: 14 / 14
Done
```

### Run single test
To run a single test, execute `./run.sh --test=<path/to/test.js>`

Example run:
```bash
$ ./run.sh --test=semantic_transparency/typeof/typeof-symbolic.js  
Building analysis
Modifying this file: ../primitive-symbolic-execution.js
Done modifying file
Done
Running
[x] semantic_transparency/typeof/typeof-symbolic.js
Done
```

### Test flags
Optionally, the `--debug` flag can be passed to show additional output:

Example run:
```
$ ./run.sh --test=semantic_transparency/typeof/typeof-symbolic.js --debug
Building analysis
Modifying this file: ../primitive-symbolic-execution.js
Done modifying file
Done
Running
node ../../../packages/jalangi2/src/js/commands/jalangi.js --analysis test_analysis.js semantic_transparency/typeof/typeof-symbolic.js
TEST: semantic_transparency/typeof/typeof-symbolic.js
STDOUT:
    TESTRESULT<Passed>
STDERR:
RETCODE: 0
[x] semantic_transparency/typeof/typeof-symbolic.js
Done
```
