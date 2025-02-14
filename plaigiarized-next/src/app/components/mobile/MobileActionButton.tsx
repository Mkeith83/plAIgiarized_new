'use client';

import React from 'react';
import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  useBreakpointValue
} from '@chakra-ui/react';
import { FiPlus, FiUpload, FiCamera, FiFile } from 'react-icons/fi';

interface MobileActionButtonProps {
  onUpload?: () => void;
  onScan?: () => void;
  onNew?: () => void;
}

export const MobileActionButton: React.FC<MobileActionButtonProps> = ({
  onUpload,
  onScan,
  onNew
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!isMobile) return null;

  return (
    <Box
      position="fixed"
      bottom="80px"
      right="20px"
      zIndex={20}
    >
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Add content"
          icon={<FiPlus />}
          colorScheme="blue"
          rounded="full"
          size="lg"
          shadow="lg"
        />
        <MenuList>
          {onUpload && (
            <MenuItem icon={<FiUpload />} onClick={onUpload}>
              Upload Document
            </MenuItem>
          )}
          {onScan && (
            <MenuItem icon={<FiCamera />} onClick={onScan}>
              Scan Document
            </MenuItem>
          )}
          {onNew && (
            <MenuItem icon={<FiFile />} onClick={onNew}>
              New Document
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Box>
  );
}; 