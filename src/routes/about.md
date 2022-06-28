<script lang="ts" type="module">
  import { ftPolicyId, nftPolicyId } from '$lib/functions/policyIds'
</script>

<svelte:head>

   <title>AdaMint | About</title>
</svelte:head>

# What is AdaMint?

-  AdaMint lets you create any number of currencies and NFTs you want - free of charge. You only pay Cardano network fees (< 1 ADA)!
-  All minted currencies use single Policy ID which allows their holders to be confident in their security.
-  You can easily check if tokens supposedly minted on this website are legitimate by checking their Policy Id.

# How it works

-  When you mint a new currency - you receive a Control NFT along with the newly minted tokens.  
   It is a unique token which gives you control over the amount of minted currency in your wallet.
-  If you have a Control NFT for a currency - you can mint additional tokens or burn existing ones.
-  You can only mint additional currency tokens if you already have some in your wallet - just Control NFT is not enough.
-  Send someone your Control NFT to transfer to them control over the respective currency.
-  You can burn your Control NFT to forever lock the supply of your currency.  
   If the creator of a currency sends someone or loses access to Control NFT - they lose the control over the currency.
-  Control NFT for one currency doesn't give its owner the control over any other currency.

# Legitimacy

-  Legitimate tokens cannot be forged, and cannot be minted or burned without currency Control NFT.
-  Only legitimate Control NFT for a respective currency allows control over it.
-  If tokens you want to check have either of these Policy Ids - they are **legitimate**.

#### NFT Policy Id

<span class="break-all">
> > `{nftPolicyId}`
</span>

#### Currency token Policy Id

<span class="break-all">
> > `{ftPolicyId}`
</span>
<br/>

-  **Make sure** you are checking against the token's Policy Id and not Asset Name! Identical Asset Names **do not** indicate legitimacy.
-  If given NFT and tokens are legitimate - NFT is a Control NFT of the given token if their Asset Names are identical.

# FAQ

#### Can these tokens be used as money?

Legitimate tokens are very similar to ADA, except their market supply might be changed by their owner.  
If the owner destroyed (burned) Control NFT - you can be sure its supply won't change anymore.  
These tokens are not to be mistaken for ADA, cannot be used instead of ADA and are not a replacement for ADA.  
The tokens can be traded on exchanges, sent to smart contracts, used in dApps etc.  
Tokens are as secure as ADA - they cannot be forged. They can be used as means of payment if their value is mutually agreed.  
One can even create a smart contract that will lock Control NFT in a contract that would only allow minting and burning of currency through interaction with that contract.

#### Why are my tokens displayed as gibberish in my wallet?

That means your wallet doesn't fully support Cardano metadata standards <a target="_blank" href="https://cips.cardano.org/cips/cip25/">CIP-25</a> and <a target="_blank" href="https://github.com/savaki/CIPs/blob/master/CIP-0035/CIP-0035.md">CIP-38</a>.
You can view your tokens in <a target="_blank" href="/control">Control</a> page, or by looking up your wallet address in a service like <a target="_blank" href="https://pool.pm">pool.pm</a>

#### Can I mint or burn tokens for my currency if I lose Control NFT?

No, you need Control NFT to mint or burn new currency tokens.

#### I have a Control NFT, but I do not have currency tokens in my wallet. Can I mint some?

No, you need any amount of currency tokens in your wallet to mint more. If all tokens of your currency in existense have been burned - there is no way to mint any more.

#### Can creators of this website change the supply of currencies I minted?

No, no one can mint or burn the currency without its Control NFT, really.

#### I lost my Control NFT. Can you help me regain control over the currency I created?

Currency Control NFT is unique and can only be created when currency is created.  
It can not be forged, duplicated or created for you by anyone.

#### Can I share with someone my control over my currency?

Control NFT cannot be forged or duplicated, so you can only send it to someone.  
This will transfer all control over currency to them - so you will lose yours.

#### I have seen two legitimate currencies that have the same name and icon. Did someone forge the original tokens?

Legitimate tokens cannot be forged. However anyone can create a currency that has the same name and icon as the original.  
What you need to do is to look at Asset Names of currencies in question.  
You should match them against the Asset Name communicated by the creator of the currency.  
Identical Asset Name cannot be forged. Don't fall for such a simple scam.

#### Can I burn currency I created that someone has? / Can the currency owner burn it while it's in my wallet?

No one can burn legitimate currency in your wallets - unless your entire wallet has been hacked, of course.

#### Can the currency owner withdraw his currency from my wallet?

No, they can't - unless they hack your entire wallet.

#### Can I protect the currency I created from being hacked/manipulated?

If you burn your Control NFT - no one will be able to restore it, mint or burn tokens, or otherwise manipulate your currency.  
Someone could reduce market supply by sending your currency from their wallet to an unclaimable contract - just like with ADA.

#### Can I ban someone from using my currency?

You cannot prevent someone from having your currency in their wallet if they have somewhere to get it from.

#### Can I be sure that tokens someone offered me won't get diluted (minted at will by the creator) ?

You can be sure of that if:

1. you checked that these tokens have legitimate Policy Ids

and either

2. you have seen a transaction that burns this currency's Control NFT

or

2. you have seen a transaction where this currency was minted without Control NFT.

#### Someone offered me to buy a hacked Control NFT of a currency, minted on this website. Is it legit?

It's a scam - just check its Policy Id for legitimacy. Control NFTs are unique, they cannot be forged or duplicated.  
If the Control NFT wasn't burned by the owner - only they can send it to someone.  
Or, if the currency owner's wallet was hacked and his Control NFT stolen - it's unlikely a hacker would sell it to you.

# Contacts

Have a question, suggestion or want to discuss a collaboration?
[Contact us via adamint.app@gmail.com](mailto:adamint.app@gmail.com)

<br/>
<style lang="scss">
   @use "../markdown.css"
</style>
