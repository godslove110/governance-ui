import Link from 'next/link'
import ReactMarkdown from 'react-markdown/react-markdown.min'
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/outline'
import useProposal from 'hooks/useProposal'
import ProposalStateBadge from 'components/ProposalStatusBadge'
import { InstructionPanel } from 'components/instructions/instructionPanel'
import DiscussionPanel from 'components/chat/DiscussionPanel'
import VotePanel from 'components/VotePanel'
import ApprovalQuorum from 'components/ApprovalQuorum'
import useRealm from 'hooks/useRealm'
import useProposalVotes from 'hooks/useProposalVotes'
import ProposalTimeStatus from 'components/ProposalTimeStatus'
import { option } from 'tools/core/option'
import useQueryContext from 'hooks/useQueryContext'
import React, { useEffect, useState } from 'react'
import ProposalActionsPanel from '@components/ProposalActions'
import { getRealmExplorerHost } from 'tools/routing'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import { ProposalState } from '@solana/spl-governance'
import VoteResultStatus from '@components/VoteResultStatus'
import VoteResults from '@components/VoteResults'
import { resolveProposalDescription } from '@utils/helpers'

const Proposal = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realmInfo } = useRealm()
  const { proposal, descriptionLink } = useProposal()
  const [description, setDescription] = useState('')
  const { yesVoteProgress, yesVotesRequired } = useProposalVotes(
    proposal?.account
  )

  const showResults =
    proposal &&
    proposal.account.state !== ProposalState.Cancelled &&
    proposal.account.state !== ProposalState.Draft

  const votePassed =
    proposal &&
    (proposal.account.state === ProposalState.Completed ||
      proposal.account.state === ProposalState.Executing ||
      proposal.account.state === ProposalState.SigningOff ||
      proposal.account.state === ProposalState.Succeeded)

  useEffect(() => {
    const handleResolveDescription = async () => {
      const description = await resolveProposalDescription(descriptionLink!)
      setDescription(description)
    }
    if (descriptionLink) {
      handleResolveDescription()
    }
  }, [descriptionLink])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 md:col-span-7 lg:col-span-8 space-y-3">
        {proposal ? (
          <>
            <div className="flex flex-items justify-between">
              <Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
                <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">
                  <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
                  Back
                </a>
              </Link>

              <div className="flex items-center">
                <a
                  href={`https://${getRealmExplorerHost(
                    realmInfo
                  )}/#/proposal/${proposal.pubkey.toBase58()}?programId=${proposal.owner.toBase58()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
                </a>
              </div>
            </div>

            <div className="py-4">
              <div className="flex items-center justify-between mb-1">
                <h1 className="mr-2 break-all">{proposal?.account.name}</h1>
                <ProposalStateBadge
                  proposalPk={proposal.pubkey}
                  proposal={proposal.account}
                  open={true}
                />
              </div>
            </div>

            {description && (
              <div className="pb-2">
                <ReactMarkdown className="markdown">
                  {description}
                </ReactMarkdown>
              </div>
            )}

            <InstructionPanel />
            <DiscussionPanel />
          </>
        ) : (
          <>
            <div className="animate-pulse bg-bkg-3 h-12 rounded-lg" />
            <div className="animate-pulse bg-bkg-3 h-64 rounded-lg" />
            <div className="animate-pulse bg-bkg-3 h-64 rounded-lg" />
          </>
        )}
      </div>

      <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4">
        <TokenBalanceCardWrapper proposal={option(proposal?.account)} />
        {showResults ? (
          <div className="bg-bkg-2 rounded-lg">
            <div className="p-4 md:p-6">
              {proposal?.account.state === ProposalState.Voting ? (
                <div className="flex items-end justify-between mb-4">
                  <h3 className="mb-0">Voting Now</h3>
                  <ProposalTimeStatus proposal={proposal?.account} />
                </div>
              ) : (
                <h3 className="mb-4">Results</h3>
              )}
              {proposal?.account.state === ProposalState.Voting ? (
                <div className="pb-4">
                  <ApprovalQuorum
                    yesVotesRequired={yesVotesRequired}
                    progress={yesVoteProgress}
                    showBg
                  />
                </div>
              ) : (
                <div className="pb-4">
                  <VoteResultStatus votePassed={votePassed} />
                </div>
              )}
              <VoteResults proposal={proposal.account} />
            </div>
          </div>
        ) : null}

        <VotePanel />
        <ProposalActionsPanel />
      </div>
    </div>
  )
}

export default Proposal
