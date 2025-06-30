"use client"

import { useEffect } from 'react'
import LoadingScreen from './LoadingCube'
import ContentWrapper from './ContentWrapper'
import { useLoading } from '../../contexts/LoadingContext'

export default function LoadingProvider({
  children
}: {
  children: React.ReactNode
}) {
  const { isLoading, transitionState } = useLoading();

  return (
    <>
      {isLoading && <LoadingScreen transitionState={transitionState} />}
      <ContentWrapper isLoading={isLoading}>
        {children}
      </ContentWrapper>
    </>
  );
}
