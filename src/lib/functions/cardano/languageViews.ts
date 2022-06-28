// https://github.com/Emurgo/cardano-serialization-lib/issues/281#issuecomment-990986040

export const languageViews =
  "a141005901d59f1a000302590001011a00060bc719026d00011a000249f01903e800011a000249f018201a0025cea81971f70419744d186419744d186419744d186419744d186419744d186419744d18641864186419744d18641a000249f018201a000249f018201a000249f018201a000249f01903e800011a000249f018201a000249f01903e800081a000242201a00067e2318760001011a000249f01903e800081a000249f01a0001b79818f7011a000249f0192710011a0002155e19052e011903e81a000249f01903e8011a000249f018201a000249f018201a000249f0182001011a000249f0011a000249f0041a000194af18f8011a000194af18f8011a0002377c190556011a0002bdea1901f1011a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000242201a00067e23187600010119f04c192bd200011a000249f018201a000242201a00067e2318760001011a000242201a00067e2318760001011a0025cea81971f704001a000141bb041a000249f019138800011a000249f018201a000302590001011a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a00330da70101ff"

export const costModel = {
  plutusV1: 0,
  cost: [
    197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000, 0, 1, 150000, 32, 2477736,
    29175, 4, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773,
    100, 100, 100, 29773, 100, 150000, 32, 150000, 32, 150000, 32, 150000, 1000,
    0, 1, 150000, 32, 150000, 1000, 0, 8, 148000, 425507, 118, 0, 1, 1, 150000,
    1000, 0, 8, 150000, 112536, 247, 1, 150000, 10000, 1, 136542, 1326, 1, 1000,
    150000, 1000, 1, 150000, 32, 150000, 32, 150000, 32, 1, 1, 150000, 1,
    150000, 4, 103599, 248, 1, 103599, 248, 1, 145276, 1366, 1, 179690, 497, 1,
    150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32,
    148000, 425507, 118, 0, 1, 1, 61516, 11218, 0, 1, 150000, 32, 148000,
    425507, 118, 0, 1, 1, 148000, 425507, 118, 0, 1, 1, 2477736, 29175, 4, 0,
    82363, 4, 150000, 5000, 0, 1, 150000, 32, 197209, 0, 1, 1, 150000, 32,
    150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32,
    3345831, 1, 1,
  ]
}

export function fromCostModelJson(model: unknown) {
  return [
    model["addInteger-cpu-arguments-intercept"],
    model["addInteger-cpu-arguments-slope"],
    model["addInteger-memory-arguments-intercept"],
    model["addInteger-memory-arguments-slope"],
    model["appendByteString-cpu-arguments-intercept"],
    model["appendByteString-cpu-arguments-slope"],
    model["appendByteString-memory-arguments-intercept"],
    model["appendByteString-memory-arguments-slope"],
    model["appendString-cpu-arguments-intercept"],
    model["appendString-cpu-arguments-slope"],
    model["appendString-memory-arguments-intercept"],
    model["appendString-memory-arguments-slope"],
    model["bData-cpu-arguments"],
    model["bData-memory-arguments"],
    model["blake2b-cpu-arguments-intercept"],
    model["blake2b-cpu-arguments-slope"],
    model["blake2b-memory-arguments"],
    model["cekApplyCost-exBudgetCPU"],
    model["cekApplyCost-exBudgetMemory"],
    model["cekBuiltinCost-exBudgetCPU"],
    model["cekBuiltinCost-exBudgetMemory"],
    model["cekConstCost-exBudgetCPU"],
    model["cekConstCost-exBudgetMemory"],
    model["cekDelayCost-exBudgetCPU"],
    model["cekDelayCost-exBudgetMemory"],
    model["cekForceCost-exBudgetCPU"],
    model["cekForceCost-exBudgetMemory"],
    model["cekLamCost-exBudgetCPU"],
    model["cekLamCost-exBudgetMemory"],
    model["cekStartupCost-exBudgetCPU"],
    model["cekStartupCost-exBudgetMemory"],
    model["cekVarCost-exBudgetCPU"],
    model["cekVarCost-exBudgetMemory"],
    model["chooseData-cpu-arguments"],
    model["chooseData-memory-arguments"],
    model["chooseList-cpu-arguments"],
    model["chooseList-memory-arguments"],
    model["chooseUnit-cpu-arguments"],
    model["chooseUnit-memory-arguments"],
    model["consByteString-cpu-arguments-intercept"],
    model["consByteString-cpu-arguments-slope"],
    model["consByteString-memory-arguments-intercept"],
    model["consByteString-memory-arguments-slope"],
    model["constrData-cpu-arguments"],
    model["constrData-memory-arguments"],
    model["decodeUtf8-cpu-arguments-intercept"],
    model["decodeUtf8-cpu-arguments-slope"],
    model["decodeUtf8-memory-arguments-intercept"],
    model["decodeUtf8-memory-arguments-slope"],
    model["divideInteger-cpu-arguments-constant"],
    model["divideInteger-cpu-arguments-model-arguments-intercept"],
    model["divideInteger-cpu-arguments-model-arguments-slope"],
    model["divideInteger-memory-arguments-intercept"],
    model["divideInteger-memory-arguments-minimum"],
    model["divideInteger-memory-arguments-slope"],
    model["encodeUtf8-cpu-arguments-intercept"],
    model["encodeUtf8-cpu-arguments-slope"],
    model["encodeUtf8-memory-arguments-intercept"],
    model["encodeUtf8-memory-arguments-slope"],
    model["equalsByteString-cpu-arguments-constant"],
    model["equalsByteString-cpu-arguments-intercept"],
    model["equalsByteString-cpu-arguments-slope"],
    model["equalsByteString-memory-arguments"],
    model["equalsData-cpu-arguments-intercept"],
    model["equalsData-cpu-arguments-slope"],
    model["equalsData-memory-arguments"],
    model["equalsInteger-cpu-arguments-intercept"],
    model["equalsInteger-cpu-arguments-slope"],
    model["equalsInteger-memory-arguments"],
    model["equalsString-cpu-arguments-constant"],
    model["equalsString-cpu-arguments-intercept"],
    model["equalsString-cpu-arguments-slope"],
    model["equalsString-memory-arguments"],
    model["fstPair-cpu-arguments"],
    model["fstPair-memory-arguments"],
    model["headList-cpu-arguments"],
    model["headList-memory-arguments"],
    model["iData-cpu-arguments"],
    model["iData-memory-arguments"],
    model["ifThenElse-cpu-arguments"],
    model["ifThenElse-memory-arguments"],
    model["indexByteString-cpu-arguments"],
    model["indexByteString-memory-arguments"],
    model["lengthOfByteString-cpu-arguments"],
    model["lengthOfByteString-memory-arguments"],
    model["lessThanByteString-cpu-arguments-intercept"],
    model["lessThanByteString-cpu-arguments-slope"],
    model["lessThanByteString-memory-arguments"],
    model["lessThanEqualsByteString-cpu-arguments-intercept"],
    model["lessThanEqualsByteString-cpu-arguments-slope"],
    model["lessThanEqualsByteString-memory-arguments"],
    model["lessThanEqualsInteger-cpu-arguments-intercept"],
    model["lessThanEqualsInteger-cpu-arguments-slope"],
    model["lessThanEqualsInteger-memory-arguments"],
    model["lessThanInteger-cpu-arguments-intercept"],
    model["lessThanInteger-cpu-arguments-slope"],
    model["lessThanInteger-memory-arguments"],
    model["listData-cpu-arguments"],
    model["listData-memory-arguments"],
    model["mapData-cpu-arguments"],
    model["mapData-memory-arguments"],
    model["mkCons-cpu-arguments"],
    model["mkCons-memory-arguments"],
    model["mkNilData-cpu-arguments"],
    model["mkNilData-memory-arguments"],
    model["mkNilPairData-cpu-arguments"],
    model["mkNilPairData-memory-arguments"],
    model["mkPairData-cpu-arguments"],
    model["mkPairData-memory-arguments"],
    model["modInteger-cpu-arguments-constant"],
    model["modInteger-cpu-arguments-model-arguments-intercept"],
    model["modInteger-cpu-arguments-model-arguments-slope"],
    model["modInteger-memory-arguments-intercept"],
    model["modInteger-memory-arguments-minimum"],
    model["modInteger-memory-arguments-slope"],
    model["multiplyInteger-cpu-arguments-intercept"],
    model["multiplyInteger-cpu-arguments-slope"],
    model["multiplyInteger-memory-arguments-intercept"],
    model["multiplyInteger-memory-arguments-slope"],
    model["nullList-cpu-arguments"],
    model["nullList-memory-arguments"],
    model["quotientInteger-cpu-arguments-constant"],
    model["quotientInteger-cpu-arguments-model-arguments-intercept"],
    model["quotientInteger-cpu-arguments-model-arguments-slope"],
    model["quotientInteger-memory-arguments-intercept"],
    model["quotientInteger-memory-arguments-minimum"],
    model["quotientInteger-memory-arguments-slope"],
    model["remainderInteger-cpu-arguments-constant"],
    model["remainderInteger-cpu-arguments-model-arguments-intercept"],
    model["remainderInteger-cpu-arguments-model-arguments-slope"],
    model["remainderInteger-memory-arguments-intercept"],
    model["remainderInteger-memory-arguments-minimum"],
    model["remainderInteger-memory-arguments-slope"],
    model["sha2_256-cpu-arguments-intercept"],
    model["sha2_256-cpu-arguments-slope"],
    model["sha2_256-memory-arguments"],
    model["sha3_256-cpu-arguments-intercept"],
    model["sha3_256-cpu-arguments-slope"],
    model["sha3_256-memory-arguments"],
    model["sliceByteString-cpu-arguments-intercept"],
    model["sliceByteString-cpu-arguments-slope"],
    model["sliceByteString-memory-arguments-intercept"],
    model["sliceByteString-memory-arguments-slope"],
    model["sndPair-cpu-arguments"],
    model["sndPair-memory-arguments"],
    model["subtractInteger-cpu-arguments-intercept"],
    model["subtractInteger-cpu-arguments-slope"],
    model["subtractInteger-memory-arguments-intercept"],
    model["subtractInteger-memory-arguments-slope"],
    model["tailList-cpu-arguments"],
    model["tailList-memory-arguments"],
    model["trace-cpu-arguments"],
    model["trace-memory-arguments"],
    model["unBData-cpu-arguments"],
    model["unBData-memory-arguments"],
    model["unConstrData-cpu-arguments"],
    model["unConstrData-memory-arguments"],
    model["unIData-cpu-arguments"],
    model["unIData-memory-arguments"],
    model["unListData-cpu-arguments"],
    model["unListData-memory-arguments"],
    model["unMapData-cpu-arguments"],
    model["unMapData-memory-arguments"],
    model["verifySignature-cpu-arguments-intercept"],
    model["verifySignature-cpu-arguments-slope"],
    model["verifySignature-memory-arguments"]
  ]
}